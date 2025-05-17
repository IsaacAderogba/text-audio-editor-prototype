import { EditorState, EditorStateConfig, Plugin, Transaction } from "prosemirror-state";
import { DirectEditorProps, EditorView } from "prosemirror-view";
import { EventEmitter } from "../../utilities/EventEmitter";
import { Extension } from "../extensions/Extension";
import { PageTrackObservable } from "../observables/PageTrackObservable";
import { CommandChainProps, createCommandChain } from "./transform/chain";

type EditorEvents = {
  mount: (data: { view: EditorView }) => void;
  unmount: (data: { view: EditorView }) => void;
};

interface EditorOptions extends Omit<EditorStateConfig, "plugins"> {
  extensions: Extension[];
  context: DocumentContext;
  onStateTransaction: (tr: Transaction) => void;
}

interface DocumentContext {
  track: PageTrackObservable;
}

export class DocumentEditor extends EventEmitter<EditorEvents> {
  private onStateTransaction: (tr: Transaction) => void;
  public extensions = new Map<string, Extension>();
  public state: EditorState;
  public commands = {} as Commands;
  public context: DocumentContext;

  constructor(
    public id: string,
    { context, extensions, onStateTransaction, ...stateOptions }: EditorOptions
  ) {
    super();
    this.context = context;
    for (const extension of extensions) {
      this.extensions.set(extension.name, extension.bind(this));
    }

    let commands = {} as Commands;
    this.extensions.forEach(extension => {
      const extensionCommands = extension.initializeCommands?.();
      if (extensionCommands) commands = { ...commands, ...extensionCommands };
    });
    this.commands = commands;

    const plugins: Plugin[] = [];
    this.extensions.forEach(extension => {
      const extensionPlugins = extension.initializePlugins?.();
      if (extensionPlugins) plugins.push(...Object.values(extensionPlugins));
    });

    this.state = EditorState.create({ ...stateOptions, plugins });
    this.onStateTransaction = onStateTransaction;
  }

  private _view?: EditorView;
  get view() {
    if (!this._view) {
      throw new Error("Cannot access `view` before it has been mounted.");
    }

    return this._view;
  }

  public chain = (props: Pick<CommandChainProps, "dispatchMode" | "tr"> = {}) =>
    createCommandChain({ ...props, editor: this });

  public mount = (
    mount: HTMLElement,
    options: Omit<DirectEditorProps, "state" | "dispatchTransaction"> = {}
  ) => {
    const view = new EditorView(
      { mount },
      { ...options, state: this.state, dispatchTransaction: this.onStateTransaction }
    );

    this._view = view;
    this.emit("mount", { view });
    return view;
  };

  public unmount = () => {
    if (this._view) {
      this._view.destroy();
      this.emit("unmount", { view: this._view });
      this._view = undefined;
    }

    this.listeners.clear();
  };
}
