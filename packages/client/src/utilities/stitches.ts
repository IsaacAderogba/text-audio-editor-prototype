import type * as Stitches from "@stitches/react";
import { createStitches } from "@stitches/react";
import {
  blackA,
  blueA,
  blueDarkA,
  brownA,
  brownDarkA,
  gray,
  grayA,
  grayDark,
  grayDarkA,
  greenA,
  greenDarkA,
  orangeA,
  orangeDarkA,
  pinkA,
  pinkDarkA,
  purpleA,
  purpleDarkA,
  redA,
  redDarkA,
  slateA,
  slateDarkA,
  whiteA,
  yellowA,
  yellowDarkA
} from "@radix-ui/colors";

export const {
  css,
  globalCss,
  keyframes,
  getCssText,
  theme: lightTheme,
  createTheme,
  config,
  styled
} = createStitches({
  prefix: "amino",
  theme: {
    breakpoints: {
      bp0: "360px",
      bp1: "520px",
      bp2: "768px",
      bp3: "1048px"
    },
    colors: {
      ...gray,
      ...whiteA,
      ...blackA,
      ...grayA,
      ...slateA,
      ...blueA,
      ...greenA,
      ...redA,
      ...redA,
      ...yellowA,
      ...orangeA,
      ...brownA,
      ...purpleA,
      ...pinkA,

      text: "rgba(000,000,000, 0.80)",
      label: "rgba(000,000,000, 0.60)",
      disable: "rgba(000,000,000, 0.25)",
      border: "rgba(000,000,000, 0.12)",
      neutral: "rgba(000, 000, 000, 0.05)",
      danger: "#d10005c1",
      foreground: "rgb(26, 26, 26)",
      background: "rgba(249,249,249, 1)",
      surface: "rgba(255,255,255, 1)",
      translucent: "rgba(255,255,255, 0.75)",
      mask: "rgba(255, 255, 255, 0.5)"
    },
    fonts: {
      serif: `ui-serif, Georgia, Cambria, "Times New Roman", Times, serif`,
      sans: `ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
      mono: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`
    },
    fontSizes: {
      xs: "12px",
      sm: "14px",
      base: "16px",
      md: "18px",
      lg: "20px",
      xl: "24px",
      xxl: "28px"
    },
    fontWeights: {
      light: 300,
      normal: 400,
      medium: 500,
      bold: 700
    },
    letterSpacings: {
      xs: "0.0025em",
      sm: "0em",
      base: "0em",
      md: "-0.0025em",
      lg: "-0.005em",
      xl: "-0.00625em",
      xxl: "-0.0075em"
    },
    lineHeights: {
      xs: "16px",
      sm: "20px",
      base: "24px",
      md: "27px",
      lg: "30px",
      xl: "34px",
      xxl: "38px"
    },
    shadows: {
      sm: "rgba(0, 0, 0, 0.08) 0px 4px 8px",
      base: "rgba(0, 0, 0, 0.19) 0px 8px 16px"
    },
    space: {
      xxs: "0.125rem",
      xs: "0.25rem",
      sm: "0.5rem",
      base: "0.75rem",
      md: "1rem",
      lg: "1.5rem",
      xl: "2.25rem",
      xxl: "4rem"
    },
    radii: {
      xs: "2px",
      sm: "4px",
      base: "8px",
      md: "12px"
    }
  }
});

export const darkTheme = createTheme({
  colors: {
    ...grayDark,
    ...whiteA,
    ...blackA,
    ...grayDarkA,
    ...slateDarkA,
    ...blueDarkA,
    ...greenDarkA,
    ...redDarkA,
    ...yellowDarkA,
    ...orangeDarkA,
    ...brownDarkA,
    ...purpleDarkA,
    ...pinkDarkA,

    text: "rgba(255,255,255, 0.85)",
    label: "rgba(255,255,255, 0.60)",
    disable: "rgba(255,255,255, 0.25)",
    border: "rgba(255,255,255, 0.15)",
    foreground: "rgba(255,255,255, 1)",
    neutral: "rgba(255, 255, 255, 0.06)",
    danger: "#fe4e54e4",
    background: "rgba(19,20,21,1)",
    surface: "rgba(39,40,43,1)",
    translucent: "rgba(22,25,22,0.8)",
    mask: "rgba(32, 32, 32, 0.35)"
  },
  shadows: {
    sm: "rgba(0, 0, 0, 0.25) 0px 4px 8px",
    base: "rgba(0, 0, 0, 0.40) 0px 8px 16px"
  }
});

export const globalStyles = globalCss({
  "html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a, abbr, acronym, address, big, cite, code, del, dfn, em, img, ins, kbd, q, s, samp, small, strike, strong, sub, sup, tt, var, b, u, i, center, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article, aside, canvas, details, embed, figure, figcaption, footer, header, hgroup, main, menu, nav, output, ruby, section, summary, time, mark, audio, video":
    {
      margin: "0",
      padding: "0",
      border: "0",
      fontSize: "100%",
      font: "inherit",
      verticalAlign: "baseline"
    },
  "html, body, #root": {
    height: "100%",
    overflow: "hidden",
    cursor: "default"
  },
  "article, aside, details, figcaption, figure, footer, header, hgroup, main, menu, nav, section": {
    display: "block"
  },
  "*": {
    boxSizing: "border-box",
    outline: "none"
  },
  "*[hidden]": {
    display: "none"
  },
  a: {
    textDecoration: "underline",
    outline: "none",
    color: "inherit",
    transition: "opacity 100ms",
    cursor: "default"
  },
  "a:hover": { opacity: 0.8 },
  "i, em": {
    fontStyle: "italic"
  },
  "b, strong": {
    fontWeight: 600
  },
  u: { textDecoration: "underline" },
  s: { textDecoration: "line-through" },
  body: {
    lineHeight: "normal",
    fontFamily: "$sans",
    background: "transparent"
  },
  "h1, h2, h3, h4, h5, h6": {
    margin: "0"
  },
  "ol, ul": {
    listStyle: "none"
  },
  "blockquote, q": {
    quotes: "none"
  },
  "blockquote:before, blockquote:after, q:before, q:after": {
    content: "none"
  },
  table: {
    borderSpacing: "0"
  },
  ".drag": { "-webkit-app-region": "drag" },
  ".no-drag": { "-webkit-app-region": "no-drag" }
});

export type Size = "default" | "compact";
export type CSS = Stitches.CSS<typeof config>;
