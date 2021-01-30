// All bubble show as raw message.
import { writable } from "svelte/store";

function createAllRawStore() {
    const { subscribe, set, update } = writable(false)
    return {
        subscribe,
        set,
        update
    }
}

export const allRaw = createAllRawStore()
