import { Command, EditorState, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";

export interface CommandChainProps {
  commands: Commands;
  view: EditorView;
  dispatchMode?: "all" | "first";
  tr?: Transaction;
}

export function createCommandChain({
  dispatchMode = "all",
  commands,
  view,
  tr = view.state.tr
}: CommandChainProps) {
  const state = createChainableState({ tr, state: view.state });
  const updateChainedState = () => state.tr; // causes the getter to update

  const dispatch = (dispatchedTr: Transaction) => {
    if (dispatchedTr !== tr) throw new Error("Mismatched transaction");
  };

  const results: boolean[] = [];
  const chain = {} as CommandChain<Commands>;

  Object.entries(commands).forEach(([name, fn]) => {
    chain[name as keyof Commands] = (...args) => {
      updateChainedState();
      switch (dispatchMode) {
        case "all":
          results.push(fn(...args)(state, dispatch, view));
          return chain;
        case "first":
          if (results.some(Boolean)) return chain;
          results.push(fn(...args)(state, dispatch, view));
          return chain;
      }
    };
  });

  chain.command = fn => {
    updateChainedState();
    switch (dispatchMode) {
      case "all":
        results.push(fn(state, dispatch, view));
        return chain;
      case "first":
        if (results.some(Boolean)) return chain;
        results.push(fn(state, dispatch, view));
        return chain;
    }
  };

  chain.run = () => {
    if (!tr.getMeta("preventDispatch")) view.dispatch(tr);

    switch (dispatchMode) {
      case "all":
        return results.every(Boolean);
      case "first":
        return results.some(Boolean);
    }
  };

  return chain;
}

export function makeCommandChainable<C extends Command>(fn: C): () => Command {
  return makeChainableCommand(() => fn);
}

export function makeChainableCommand<C extends ChainableCommand>(fn: C) {
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

export type ChainableCommand = (...args: any[]) => Command;
export type CommandChain<T extends Commands> = {
  command: (fn: Command) => CommandChain<T>;
  run: () => boolean;
  // @ts-expect-error - fixme
} & { [K in keyof T]: (...a: Parameters<T[K]>) => CommandChain<T> };
