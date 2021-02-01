import { writable } from "svelte/store"

export interface User {
    nickname: string
}

export type Users = { [userid: string]: User }

function createUsersStore() {
    const { subscribe, set, update } = writable({
        1: {
            nickname: 'Test User'
        }
    } as Users)
    return {
        subscribe,
        set,
        update,
        setUser: (userid: number, userdata: User) => update(v => {
            v[userid] = userdata
            return v
        })
    }
}

export const users = createUsersStore()
