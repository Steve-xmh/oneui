
const words = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

export default function genUid (length = 16): string {
    let result = ''
    for (let i = 0; i < length; i++) {
        const r = Math.floor(Math.random() * words.length)
        result += words[r]
    }
    return result
}
