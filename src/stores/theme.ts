import { writable } from "svelte/store";

export enum Theme {
    Light,
    Dark
}

function createThemeStore() {
    const { subscribe, set, update } = writable(Theme.Dark)
    return {
        subscribe,
        setTheme: set
    }
}

export const theme = createThemeStore()
