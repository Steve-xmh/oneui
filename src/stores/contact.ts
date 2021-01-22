import { writable } from "svelte/store"
import { MessageType } from "../onebot/messages"

export function getContactID(id: number, isGroup = false): string {
    if (isGroup) {
        return 'G' + id.toString()
    } else {
        return 'U' + id.toString()
    }
}

export function getContactType(cid: string): MessageType {
    switch (cid[0]) {
        case 'U':
            return MessageType.Private
        case 'G':
            return MessageType.Group
        default:
            throw new TypeError(`${cid} is not a vaild contact id`)
    }
}

export function getUserID(cid: string): number {
    return parseInt(cid.slice(1))
}

function createContactStore() {
    const { subscribe, set } = writable('')
    return {
        subscribe,
        close: () => set(''),
        switch: (cid: string) => set(cid)
    }
}

export const contact = createContactStore()
