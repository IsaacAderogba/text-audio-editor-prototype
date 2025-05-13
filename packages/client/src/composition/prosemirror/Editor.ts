import { EditorState, EditorStateConfig, Plugin, Transaction } from "prosemirror-state";
import { DirectEditorProps, EditorView } from "prosemirror-view";
import { Extension } from "../extensions/Extension";
import { CommandChainProps, createCommandChain } from "./command/chain";
import type { CompositionObservable } from "../observables/CompositionObservable";

interface EditorEvents {
  change: (data: { state: EditorState; transaction: Transaction }) => void;
  mount: (data: { view: EditorView }) => void;
  unmount: (data: { view: EditorView }) => void;
}

interface EditorOptions extends Omit<EditorStateConfig, "plugins"> {
  extensions: Extension[];
  context: EditorContext;
}

interface EditorContext {
  composition: CompositionObservable;
}

export class Editor {
  private listeners = new Map<string, Set<Function>>();
  private extensions = new Map<string, Extension>();
  private state: EditorState;
  public commands = {} as Commands;
  public context: EditorContext;

  constructor({ context, extensions, ...stateOptions }: EditorOptions) {
    this.context = context;
    for (const extension of extensions) {
      this.extensions.set(extension.name, extension.bind(this));
    }

    let commands = {} as Commands;
    const plugins: Plugin[] = [];
    this.extensions.forEach(extension => {
      const extensionPlugins = extension.initializePlugins?.();
      if (extensionPlugins) {
        plugins.push(...Object.values(extensionPlugins));
      }

      const extensionCommands = extension.initializeCommands?.();
      if (extensionCommands) {
        commands = { ...commands, ...extensionCommands };
      }
    });

    this.commands = commands;
    this.state = EditorState.create({ ...stateOptions, plugins });
  }

  private _view?: EditorView;
  get view() {
    if (!this._view) {
      throw new Error("Cannot access `view` before it has been mounted.");
    }

    return this._view;
  }

  public chain = (props: Pick<CommandChainProps, "dispatchMode" | "tr"> = {}) =>
    createCommandChain({ ...props, commands: this.commands, view: this.view });

  public on = <E extends keyof EditorEvents>(event: E, cb: EditorEvents[E]) => {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)?.add(cb);
    return () => {
      this.listeners.get(event)?.delete(cb);
    };
  };

  public emit = <E extends keyof EditorEvents>(event: E, ...args: Parameters<EditorEvents[E]>) => {
    this.listeners.get(event)?.forEach(callback => callback(...args));
  };

  public createView = (
    mount: HTMLElement,
    options: {
      state: Omit<EditorStateConfig, "plugins">;
      view: Omit<DirectEditorProps, "state">;
    }
  ) => {
    const view = new EditorView(
      { mount },
      {
        ...options.view,
        state: this.state,
        dispatchTransaction: transaction => {
          const state = view.state.apply(transaction);
          view.updateState(state);
          this.emit("change", { state, transaction });
        }
      }
    );

    this._view = view;
    this.emit("mount", { view });
    return view;
  };

  public destroy = () => {
    if (this._view) {
      this._view.destroy();
      this.emit("unmount", { view: this._view });
      this._view = undefined;
    }

    this.listeners.clear();
  };
}
