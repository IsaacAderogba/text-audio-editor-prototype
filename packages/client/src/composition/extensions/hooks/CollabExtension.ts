import { DocumentTrack, DocumentTrackDelta } from "@taep/core";
import { collab, getVersion, receiveTransaction, sendableSteps } from "prosemirror-collab";
import { Plugin, TextSelection } from "prosemirror-state";
import { Step } from "prosemirror-transform";
import { HookExtension } from "../Extension";

export interface CollabExtensionOptions {
  onDelta: (data: DocumentTrackDelta) => void;
}

export class CollabExtension extends HookExtension {
  name = "collab";

  constructor(public options: CollabExtensionOptions) {
    super();
  }

  sendTrack: (data: DocumentTrack) => void = () => {};
  sendTrackDelta: (data: DocumentTrackDelta) => void = () => {};

  initializePlugins = () => {
    const { onDelta } = this.options;

    return {
      collab: collab({
        version: this.editor.context.track.state.version,
        clientID: this.editor.id
      }),
      collabSync: new Plugin({
        view: view => {
          this.sendTrack = async data => {
            // replace document state to get it back in sync
            const state = this.editor.state;
            const doc = state.schema.nodeFromJSON(data);
            const tr = state.tr.replaceWith(0, state.doc.content.size, doc.content);
            tr.setMeta("collab", { version: data.version, unconfirmed: [] });

            try {
              tr.setSelection(TextSelection.create(tr.doc, state.selection.anchor));
            } catch {
              // ignore error
            }

            view.dispatch(tr);
          };

          this.sendTrackDelta = async data => {
            if (data.version !== getVersion(view.state) + data.steps.length) return;

            const state = this.editor.state;
            const steps: Step[] = [];
            const clientIds: string[] = [];
            steps.push(...data.steps.map(step => Step.fromJSON(state.schema, step)));
            clientIds.push(...data.steps.map(() => data.clientId));

            view.dispatch(receiveTransaction(view.state, steps, clientIds));
          };

          return {
            update: async () => {
              const message = sendableSteps(view.state);
              if (!message) return;

              onDelta({
                type: "delta",
                clientId: message.clientID as string,
                version: message.version,
                steps: message.steps.map(step => step.toJSON())
              });
            }
          };
        }
      })
    };
  };
}
