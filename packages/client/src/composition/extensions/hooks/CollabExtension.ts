import { DocumentTrack, DocumentTrackChange, getAttrs } from "@taep/core";
import { collab, getVersion, receiveTransaction, sendableSteps } from "prosemirror-collab";
import { Plugin, TextSelection } from "prosemirror-state";
import { Step } from "prosemirror-transform";
import { HookExtension } from "../Extension";

export interface CollabExtensionOptions {
  onPublish: (input: DocumentTrackChange) => void;
  onSubscribe: (dispatch: (output: DocumentTrackChange) => void) => void;
  pull: (version: number) => Promise<DocumentTrackChange | DocumentTrack | null>;
}

export class CollabExtension extends HookExtension {
  name = "collab";

  constructor(public options: CollabExtensionOptions) {
    super();
  }

  initializePlugins = () => {
    const { pull, onSubscribe, onPublish } = this.options;

    return {
      collab: collab({
        version: getAttrs<DocumentTrack>(this.editor.state.doc).latestVersion,
        clientID: this.editor.id
      }),
      collabDispatch: new Plugin({
        view: view => {
          onSubscribe(async message => {
            const version = getVersion(view.state);
            const data = message.version === version ? message : await pull(version);
            if (!data) return;

            const state = this.editor.state;
            if ("type" in data) {
              const doc = state.schema.nodeFromJSON(data);
              const tr = state.tr.replaceWith(0, state.doc.content.size, doc.content);
              tr.setMeta("collab", { version: data.attrs.latestVersion, unconfirmed: [] });

              try {
                // try to preserve selection, even if we're forcefully updating the document
                tr.setSelection(TextSelection.create(tr.doc, state.selection.anchor));
              } catch {
                // ignore error
              }

              view.dispatch(tr);
            } else {
              const tr = receiveTransaction(
                view.state,
                data.changes.map(step => Step.fromJSON(state.schema, step)),
                data.clientIds
              );
              view.dispatch(tr);
            }
          });

          return {
            update: () => {
              const message = sendableSteps(view.state);
              if (!message) return;

              onPublish({
                acknowledged: true,
                version: message.version,
                clientIds: message.steps.map(() => message.clientID as string),
                changes: message.steps.map(step => step.toJSON())
              });
            }
          };
        }
      })
    };
  };
}
