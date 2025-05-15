import { DocumentTrack, DocumentTrackChange, getAttrs } from "@taep/core";
import { collab, getVersion, receiveTransaction, sendableSteps } from "prosemirror-collab";
import { Plugin, TextSelection } from "prosemirror-state";
import { Step } from "prosemirror-transform";
import { HookExtension } from "../Extension";

export interface CollabExtensionOptions {
  publish: (data: DocumentTrackChange) => Promise<DocumentTrackChange | DocumentTrack>;
  onSubscribe: (dispatch: (data: DocumentTrackChange) => void) => () => void;
}

export class CollabExtension extends HookExtension {
  name = "collab";

  constructor(public options: CollabExtensionOptions) {
    super();
  }

  initializePlugins = () => {
    const { onSubscribe, publish } = this.options;

    return {
      collab: collab({
        version: getAttrs<DocumentTrack>(this.editor.state.doc).latestVersion,
        clientID: this.editor.id
      }),
      collabSync: new Plugin({
        view: view => {
          const dispatch = async (data: DocumentTrackChange[]) => {
            if (data[0]?.version !== getVersion(view.state)) return;

            const state = this.editor.state;
            const steps: Step[] = [];
            const clientIds: string[] = [];
            for (const { changes, clientId } of data) {
              steps.push(...changes.map(step => Step.fromJSON(state.schema, step)));
              clientIds.push(...changes.map(() => clientId));
            }

            view.dispatch(receiveTransaction(view.state, steps, clientIds));
          };

          const unsubscribe = onSubscribe(data => dispatch([data]));

          return {
            destroy: unsubscribe,
            update: async () => {
              const message = sendableSteps(view.state);
              if (!message) return;

              const data = await publish({
                clientId: message.clientID as string,
                version: message.version,
                changes: message.steps.map(step => step.toJSON())
              });

              if ("version" in data) return dispatch([data]);

              const version = getVersion(view.state);
              const idx = data.attrs.changes.findIndex(change => change.version === version);
              if (idx !== -1) {
                dispatch(data.attrs.changes.slice(idx));
              } else {
                // replace document state to get it back in sync
                const state = this.editor.state;
                const doc = state.schema.nodeFromJSON(data);
                const tr = state.tr.replaceWith(0, state.doc.content.size, doc.content);
                tr.setMeta("collab", { version: data.attrs.latestVersion, unconfirmed: [] });

                try {
                  tr.setSelection(TextSelection.create(tr.doc, state.selection.anchor));
                } catch {
                  // ignore error
                }

                view.dispatch(tr);
              }
            }
          };
        }
      })
    };
  };
}
