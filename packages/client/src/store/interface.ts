import { makeAutoObservable } from "mobx";
import type { StoreObservable } from "./store";
import { DeepPartial } from "../utilities/types";
import { merge } from "lodash-es";
import { darkTheme, lightTheme } from "../utilities/stitches";

export type InterfaceThemePreference = "dark" | "light" | "system";
export type InterfaceThemeMode = "dark" | "light";
export interface InterfaceState {
  themeMode: InterfaceThemeMode;
}

export class InterfaceStoreObservable {
  store: StoreObservable;
  state: InterfaceState;

  constructor(store: StoreObservable) {
    makeAutoObservable(this);

    this.store = store;
    this.state = this.initializeState();
  }

  private initializeState(): InterfaceState {
    const preference = this.store.cache.state.interfaceThemePreference || "light";
    return { themeMode: setThemeMode(preference) };
  }

  setState(state: DeepPartial<InterfaceState>) {
    merge(this.state, state);
  }

  setThemePreference = (preference: InterfaceThemePreference) => {
    this.store.cache.set("interfaceThemePreference", preference);
    this.state.themeMode = setThemeMode(preference);
  };
}

const themeClassNames = {
  light: lightTheme.className,
  dark: darkTheme.className
};

const setThemeMode = (preference: InterfaceThemePreference): InterfaceThemeMode => {
  const nextMode = getThemeMode(preference);
  const prevMode = nextMode === "dark" ? "light" : "dark";

  document.documentElement.classList.remove(themeClassNames[prevMode]);
  document.documentElement.classList.remove(prevMode);
  document.documentElement.classList.add(themeClassNames[nextMode]);
  document.documentElement.classList.add(nextMode);

  document.documentElement.setAttribute("data-theme", nextMode);
  return nextMode;
};

const getThemeMode = (preference: InterfaceThemePreference): InterfaceThemeMode => {
  const systemMode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  return preference === "system" ? systemMode : preference;
};
