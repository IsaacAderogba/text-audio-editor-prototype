import { Command, EditorState, Transaction } from "prosemirror-state";
import type { DocumentEditor } from "../DocumentEditor";
import { EditorView } from "prosemirror-view";

export type EditorCommand = (
  state: EditorState,
  dispatch: undefined | ((tr: Transaction) => void),
  view: undefined | EditorView,
  editor: DocumentEditor
) => boolean;

export interface CommandChainProps {
  editor: DocumentEditor;
  dispatchMode?: "all" | "first" | "test";
  tr?: Transaction;
}

export function createCommandChain({
  editor,
  dispatchMode = "all",
  tr = editor.view.state.tr
}: CommandChainProps) {
  const state = createChainableState({ tr, state: editor.view.state });
  const updateChainedState = () => state.tr; // causes the getter to update

  const shouldDispatch = ["all", "first"].includes(dispatchMode);
  const dispatch = shouldDispatch
    ? (dispatchedTr: Transaction) => {
        if (dispatchedTr !== tr) throw new Error("Mismatched transaction");
      }
    : undefined;

  const results: boolean[] = [];
  const chain = {} as CommandChain<Commands>;

  Object.entries(editor.commands).forEach(([name, fn]) => {
    chain[name as keyof Commands] = (...args) => {
      updateChainedState();
      switch (dispatchMode) {
        case "all":
        case "test":
          results.push(fn(...args)(state, dispatch, editor.view, editor));
          return chain;
        case "first":
          if (results.some(Boolean)) return chain;
          results.push(fn(...args)(state, dispatch, editor.view, editor));
          return chain;
      }
    };
  });

  chain.command = fn => {
    updateChainedState();
    switch (dispatchMode) {
      case "all":
      case "test":
        results.push(fn(state, dispatch, editor.view, editor));
        return chain;
      case "first":
        if (results.some(Boolean)) return chain;
        results.push(fn(state, dispatch, editor.view, editor));
        return chain;
    }
  };

  chain.run = () => {
    if (!tr.getMeta("preventDispatch")) editor.view.dispatch(tr);

    switch (dispatchMode) {
      case "all":
      case "test":
        return results.every(Boolean);
      case "first":
        return results.some(Boolean);
    }
  };

  return chain;
}

export function convertCommand<C extends Command>(fn: C): () => EditorCommand {
  return chainCommand(() => fn);
}

export function chainCommand<C extends ChainableCommand>(fn: C) {
  return (...args: Parameters<C>) => fn(...args);
}

interface ChainableStateProps {
  tr: Transaction;
  state: EditorState;
}

export function createChainableState({ state, tr }: ChainableStateProps): EditorState {
  let { selection } = tr;
  let { doc } = tr;
  let { storedMarks } = tr;

  return {
    ...state,
    schema: state.schema,
    plugins: state.plugins,
    apply: state.apply.bind(state),
    applyTransaction: state.applyTransaction.bind(state),
    reconfigure: state.reconfigure.bind(state),
    toJSON: state.toJSON.bind(state),
    get storedMarks() {
      return storedMarks;
    },
    get selection() {
      return selection;
    },
    get doc() {
      return doc;
    },
    get tr() {
      selection = tr.selection;
      doc = tr.doc;
      storedMarks = tr.storedMarks;

      return tr;
    }
  };
}

export type ChainableCommand = (...args: any[]) => EditorCommand;
export type CommandChain<T extends Commands> = {
  command: (fn: EditorCommand) => CommandChain<T>;
  run: () => boolean;
  // @ts-expect-error - fixme
} & { [K in keyof T]: (...a: Parameters<T[K]>) => CommandChain<T> };
