import { writable } from "svelte/store";
import { CQFaceType } from "./face";
import { Theme } from "./theme";

interface SettingsObject {
    [key: string]: any
}

const defaultSettings: SettingsObject = {
    markdown: false,
    allRaw: false,
    hideFaceOutline: false,
    faceType: CQFaceType.Static,
    theme: Theme.Dark
}

const prefix = 'setting.'

function collectSettings() {
    const result: SettingsObject = {}
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(prefix)) {
            const storeKey = key.substring(prefix.length)
            result[storeKey] = JSON.parse(localStorage.getItem(key) as string)
        }
    }
    return result
}

function updateSettings(value: SettingsObject) {
    for (const key in value) {
        if (key in defaultSettings && value[key] !== defaultSettings[key]) {
            localStorage.setItem(prefix + key, JSON.stringify(value[key]))
        } else if (localStorage.getItem(prefix + key)) {
            localStorage.removeItem(prefix + key)
        }
    }
}

function createSettingsStore() {
    const { subscribe, set, update } = writable(Object.assign(Object.assign({}, defaultSettings), collectSettings()))
    return {
        subscribe,
        reset: () => {
            const value = Object.assign({}, defaultSettings)
            set(value)
            updateSettings(value)
        },
        setSetting: (key: string, value: any) => update(v => {
            v[key] = value
            updateSettings(v)
            return v
        })
    }
}

export const settings = createSettingsStore()
