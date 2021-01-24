import { writable } from "svelte/store";

export interface SelfData {
    userId: number
    userName: string
    friends: Friend[]
    groups: Group[]
}

export interface Friend {
    user_id: number
    nickname: string
    remark: string
}

export interface Group {
    group_id: number
    group_name: string
    member_count: number
    max_member_count: number
}

function createSelfStore() {
    const selfData: SelfData = {
        userId: 0,
        userName: '',
        friends: [],
        groups: []
    }
    const { subscribe, set, update } = writable(selfData)
    return {
        subscribe,
        setFriends: (friends: Friend[]) => update(v => {
            v.friends = friends
            return v
        }),
        setGroups: (groups: Group[]) => update(v => {
            v.groups = groups
            return v
        }),
        setSelf: (userId: number, userName: string) => update(v => {
            v.userId = userId
            v.userName = userName
            return v
        }),
        reset: () => set({
            userId: 0,
            userName: '',
            friends: [],
            groups: []
        })
    }
}

export const selfData = createSelfStore()
