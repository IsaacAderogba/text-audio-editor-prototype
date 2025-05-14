import { NodeName } from "@taep/core";
import { Plugin } from "prosemirror-state";
import { NodeExtension } from "../Extension";

export class PageExtension extends NodeExtension {
  name = NodeName.page;

  initializePlugins = () => {
    return {
      page: new Plugin({
        props: {
          attributes: { class: this.name }
        }
      })
    };
  };
}
