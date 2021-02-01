/**
 * @fileoverview
 * A simple SLIKv3/AMR audio decoder.
 */
import DecodeWorker from 'web-worker:./audio-worker.ts'
import { create } from 'web-worker-proxy'
import type { DecodeWorkerProxy } from './audio-worker'

const decodeWorker = create(new DecodeWorker()) as DecodeWorkerProxy;

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
const silkHeader = new Uint8Array([0x23, 0x21, 0x53, 0x49, 0x4C, 0x4B, 0x5F, 0x56, 0x33])
// #!AMR\n
const amrHeader = new Uint8Array([0x23, 0x21, 0x41, 0x4d, 0x52, 0x0a])

function isSLIKAudio (data: Uint8Array): number {
    if (data.length < silkHeader.length) {
        return 0
    } else if (data[0] === 0x02) {
        if (data.length < silkHeader.length + 1) {
            return 0
        } else {
            return isEqual(data.subarray(1, 1 + silkHeader.length), silkHeader) ? silkHeader.length + 1 : 0
        }
    } else {
        return isEqual(data.subarray(0, silkHeader.length), silkHeader) ? silkHeader.length : 0
    }
}

function isAMRAudio (data: Uint8Array): boolean {
    if (data.length < silkHeader.length) {
        return false
    } else {
        return isEqual(data.subarray(0, amrHeader.length), amrHeader)
    }
}

/**
 * Decode silkv3/amr audio, return raw pcm wave array (s16le, 24000 rate, 1 channel)
 * @param data The raw silk data
 */
export async function decode (data: Uint8Array): Promise<DecodeResult> {
    if (isAMRAudio(data)) {
        return {
            wave: await decodeWorker.decodeAMR(data),
            type: 'amr'
        }
    } else if (isSLIKAudio(data) !== 0) {
        return {
            wave: await decodeWorker.decodeSilkV3(data),
            type: 'silk'
        }
    } else {
        throw new Error("Can't detect silk/amr audio header, not a correct silk/amr audio.")
    }
}

const ctx = new AudioContext()

export interface PCMSource {
    length: number
    rate: number
    source: Float32Array
    ctx: AudioContext
}

export interface DecodeResult {
    wave: Float32Array
    type: 'silk' | 'amr'
}

const rate = {
    silk: 24000,
    amr: 8000
}

export function makeAudioSource(wave: DecodeResult): PCMSource {
    return {
        length: wave.wave.length / rate[wave.type],
        source: wave.wave,
        rate: rate[wave.type],
        ctx
    }
}
