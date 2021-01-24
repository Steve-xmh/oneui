import { writable } from "svelte/store";

export enum CQFaceType {
    /** 使用静态 png 表情 */
    Static,
    /** 使用动态 gif 表情 */
    Dynamic
}

function createFaceStore() {
    const { subscribe, set, update } = writable(CQFaceType.Static)
    return {
        subscribe,
        useStatic: () => set(CQFaceType.Static),
        useDynamic: () => set(CQFaceType.Dynamic),
        set: (value: CQFaceType) => set(value)
    }
}

export const faceType = createFaceStore()
