import { ComponentProps } from "@stitches/react";
import { styled } from "../utilities/stitches";

export const Flex = styled("div", {
  display: "flex"
});

export type FlexProps = ComponentProps<typeof Flex>;
