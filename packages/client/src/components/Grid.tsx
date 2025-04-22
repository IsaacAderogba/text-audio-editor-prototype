import { ComponentProps } from "@stitches/react";
import { styled } from "../utilities/stitches";

export const Grid = styled("div", {
  display: "grid"
});

export type GridProps = ComponentProps<typeof Grid>;
