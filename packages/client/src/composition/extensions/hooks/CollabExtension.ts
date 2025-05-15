import { DocumentTrack, DocumentTrackChange, getAttrs } from "@taep/core";
import { collab, getVersion, receiveTransaction, sendableSteps } from "prosemirror-collab";
import { Plugin, TextSelection } from "prosemirror-state";
import { Step } from "prosemirror-transform";
import { HookExtension } from "../Extension";

export interface CollabExtensionOptions {
  onPublish: (message: DocumentTrackChange) => void;
  onSubscribe: (dispatch: (message: DocumentTrackChange, forcePull?: boolean) => void) => void;
  pull: (version: number) => Promise<DocumentTrackChange[] | DocumentTrack | null>;
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
      collabSync: new Plugin({
        view: view => {
          onSubscribe(async (message, forcePull) => {
            const version = getVersion(view.state);
            const data = message.version !== version || forcePull ? await pull(version) : [message];
            if (!data) return;

            const state = this.editor.state;
            if (Array.isArray(data)) {
              const steps: Step[] = [];
              const clientIds: string[] = [];
              for (const { changes, clientId } of data) {
                steps.push(...changes.map(step => Step.fromJSON(state.schema, step)));
                clientIds.push(...changes.map(() => clientId));
              }

              view.dispatch(receiveTransaction(view.state, steps, clientIds));
            } else {
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
            }
          });

          return {
            update: () => {
              const message = sendableSteps(view.state);
              if (!message) return;

              onPublish({
                clientId: message.clientID as string,
                version: message.version,
                changes: message.steps.map(step => step.toJSON())
              });
            }
          };
        }
      })
    };
  };
}
