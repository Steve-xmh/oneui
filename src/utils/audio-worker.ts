/**
 * @fileoverview
 * WebWorker side of audio decoder.
 */

importScripts('../amrnb.min.js', '../silksdk.js')

import { proxy } from 'web-worker-proxy'

import type { EmscriptenModule } from './silksdk'

import genUid from './uid'

let SilkSDK: EmscriptenModule = self as unknown as EmscriptenModule

SilkSDK.print = (a: string) => console.log('[OneUI-Audio]', a)
SilkSDK.printErr = (a: string) => console.error('[OneUI-Audio]', a)

function decodeAMR (data: Uint8Array) {
    SilkSDK.print('Decoding AMR audio')
    const startTime = Date.now()
    const decoder = new self.AMR({})
    const result = decoder.decode(data)
    decoder.close()
    SilkSDK.print(`Finished decoding AMR audio in ${Date.now() - startTime} ms`)
    return result
}

function decodeSilkV3 (data: Uint8Array) {
    if (!SilkSDK) {
        throw new Error('SilkSDK is not ready.')
    }
    const startTime = Date.now()
    SilkSDK.print('Decoding SilkV3 audio')
    const sourceFile = genUid() + '.bit'
    const destFile = genUid() + '.pcm'
    SilkSDK.FS.writeFile(sourceFile, data)
    SilkSDK.callMain([sourceFile, destFile])
    const result = SilkSDK.FS.readFile(destFile)
    SilkSDK.FS.unlink(sourceFile)
    SilkSDK.FS.unlink(destFile)
    const a = new Float32Array(result.length)
    for (let i = 0; i < a.length; i++) {
        a[i] = result[i] / 32768
    }
    SilkSDK.print(`Finished decoding SilkV3 audio in ${Date.now() - startTime} ms`)
    return a
}

const workerProxy = {
    decodeAMR,
    decodeSilkV3
}

type UnpackedPromise<T> = T extends Promise<infer U> ? U : T
type GenericFunction<TS extends any[], R> = (...args: TS) => R
type Promisify<T> = {
    [K in keyof T]: T[K] extends GenericFunction<infer TS, infer R>
        ? (...args: TS) => Promise<UnpackedPromise<R>>
        : never
}

export type DecodeWorkerProxy = Promisify<typeof workerProxy>

proxy(workerProxy)
SilkSDK.print('WebWorker is ready!')
SilkSDK.print('OneUI-Audio is ready!')
