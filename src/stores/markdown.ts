// @ts-stack/markdown
import { writable } from "svelte/store";

function createMarkdownStore() {
    const { subscribe, set, update } = writable(false)
    return {
        subscribe,
        set,
        update
    }
}

export const markdown = createMarkdownStore()
