import { writable } from "svelte/store";
import { getUserID } from "./contact";

interface Message {
    userId: number
    rawMessage: string
}

type MessageDatabase = {
    [key: string]: Message[]
}

function createMessageDB() {
    const { subscribe, set, update } = writable({} as MessageDatabase)

    return {
        subscribe,
        addMessage: (contactId: string, raw_message: string, senderId: number = null) => update(v => {
            if (!(contactId in v)) {
                v[contactId] = []
            }
            v[contactId].push({
                rawMessage: raw_message,
                userId: senderId || getUserID(contactId)
            })
            console.log('Add Message', contactId, raw_message)
            return v
        }),
        reset: () => set({})
    }
}

export const messageDB = createMessageDB()
