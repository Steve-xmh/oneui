/**
 * @fileoverview
 * A simple SLIKv3 audio decoder. Work in progress.
 */

function isEqual (a: Uint8Array, b: Uint8Array) {
    if (a.length === b.length) {
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false
        }
        return true
    } else {
        return false
    }
}

// #!SILK_V3
const header = new Uint8Array([0x23, 0x21, 0x53, 0x49, 0x4C, 0x4B, 0x5F, 0x56, 0x33])

export function isSLIKAudio (data: Uint8Array): number {
    if (data.length < header.length) {
        return 0
    } else if (data[0] === 0x02) {
        if (data.length < header.length + 1) {
            return 0
        } else {
            return isEqual(data.subarray(1, 1 + header.length), header) ? header.length + 1 : 0
        }
    } else {
        return isEqual(data.subarray(0, header.length), header) ? header.length : 0
    }
}

export function decode (data: Uint8Array) {
    const firstBlockPos = isSLIKAudio(data)
    if (firstBlockPos === 0) {
        throw new Error("Can't detect silk audio header, not a correct silk audio.")
    }
    let pos = firstBlockPos
    let resultSize = 0
    while (pos < data.length - 1) {
        const blockSize = data[pos] * 0xFF + data[pos]
        resultSize += blockSize
        pos += 2 + blockSize
    }
    console.log(resultSize)
}
