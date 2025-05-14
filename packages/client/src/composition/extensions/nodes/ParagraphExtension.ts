import { NodeName } from "@taep/core";
import { NodeExtension } from "../Extension";
import { CSS } from "../../../utilities/stitches";

export class ParagraphExtension extends NodeExtension {
  name = NodeName.paragraph;

  initializeCSS = () => {
    const sharedCSS: CSS = {
      color: "$text",
      fontFamily: "$sans",
      fontWeight: "$normal",
      whiteSpace: "pre-wrap"
    };

    const compactCSS: CSS = {
      ...sharedCSS,
      fontSize: "$sm",
      lineHeight: "$sm",
      letterSpacing: "$sm"
    };

    const defaultCSS: CSS = {
      ...sharedCSS,
      fontSize: "$base",
      lineHeight: "$base",
      letterSpacing: "$base"
    };

    return { compact: compactCSS, default: defaultCSS };
  };
}
