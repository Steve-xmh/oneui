
export interface AMRDecoderOptions {
    benchmark: boolean
}

export class AMR {
    constructor(options?: Partial<AMROptions>)
    decode(bitstream: string | Uint8Array): Float32Array
    close()
}
