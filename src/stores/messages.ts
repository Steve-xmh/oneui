import { writable } from "svelte/store";
import type { CQMessage } from "../onebot/messages";
import { parse } from "../utils/cqcode";
import { getUserID } from "./contact";

interface Message {
    userId: number
    rawMessage: string
    messages: CQMessage[]
}

type MessageDatabase = {
    [key: string]: Message[]
}

function createMessageDB() {
    const { subscribe, set, update } = writable({} as MessageDatabase)

    return {
        subscribe,
        addMessage: (contactId: string, raw_message: string, senderId?: number) => update(v => {
            if (!(contactId in v)) {
                v[contactId] = []
            }
            const userId = senderId || getUserID(contactId)
            const cqmsg = parse(raw_message)
            if (v[contactId].length > 0) {
                const lastMsg = v[contactId][v[contactId].length - 1]
                if (lastMsg.userId === userId) {
                    lastMsg.rawMessage += '\n' + raw_message
                    lastMsg.messages.push(...cqmsg)
                } else {
                    v[contactId].push({
                        rawMessage: raw_message,
                        messages: cqmsg,
                        userId
                    })
                }
            } else {
                v[contactId].push({
                    rawMessage: raw_message,
                    messages: cqmsg,
                    userId
                })
            }
            console.log('Add Message', contactId, raw_message)
            return v
        }),
        reset: () => set({})
    }
}

export const messageDB = createMessageDB()
