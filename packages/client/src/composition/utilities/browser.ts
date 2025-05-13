export const isMac =
  typeof navigator != "undefined"
    ? /Mac|iP(hone|[oa]d)/.test(navigator.platform)
    : // @ts-expect-error - todo
      typeof os != "undefined" && os.platform
      ? // @ts-expect-error - todo
        os.platform() == "darwin"
      : false;
