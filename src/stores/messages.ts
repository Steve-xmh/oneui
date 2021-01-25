import { writable } from "svelte/store"
import { onebot } from "../onebot"
import type { CQMessage } from "../onebot/messages"
import { parse } from "../utils/cqcode"
import { getUserID } from "./contact"

interface Message {
    userId: number
    rawMessage: string
    messages: CQMessage[]
}

type MessageDatabase = {
    [key: string]: Message[]
}

async function resolveReply(cqMsg: CQMessage) {
    const reply = await onebot.getMessageByID(cqMsg.data.id)
    console.log('Resolved Reply', cqMsg, reply)
    if (reply.status === 'ok') {
        return parse(reply.data.raw_message).map(v => {
            if (v.type === 'reply') {
                v.data.detail = resolveReply(v)
            }
            return v
        })
    } else {
        return false
    }
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
            const cqmsg = parse(raw_message).map(v => {
                // Post process message
                if (v.type === 'reply') {
                    v.data.detail = resolveReply(v)
                } else if (v.type === 'image') {
                    v.data.detail = Promise.resolve(v.data.url)
                } else if (v.type === 'record') {
                    v.data.detail = Promise.resolve('https://cors-anywhere.herokuapp.com/' + v.data.file)
                }
                return v
            })
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
            console.log('[MessageDB]', 'Added', contactId, raw_message)
            return v
        }),
        reset: () => set({})
    }
}

export const messageDB = createMessageDB()
