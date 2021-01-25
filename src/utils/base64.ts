/**
 * @fileoverview
 * Base64 convertions, from https://stackoverflow.com/a/63526839/14123552
 */

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const base64Table = encoder.encode('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=');
export function toBase64(dataArr: Uint8Array): string {
    let padding = dataArr.byteLength % 3;
    let outputCtr = 0;
    const len = dataArr.byteLength - padding;
    padding = padding > 0 ? (3 - padding) : 0;
    const outputLen = ((len/3) * 4) + (padding > 0 ? 4 : 0);
    const output = new Uint8Array(outputLen);
    for(var i=0; i<len; i+=3){              
        var buffer = ((dataArr[i] & 0xFF) << 16) | ((dataArr[i+1] & 0xFF) << 8) | (dataArr[i+2] & 0xFF);
        output[outputCtr++] = base64Table[buffer >> 18];
        output[outputCtr++] = base64Table[(buffer >> 12) & 0x3F];
        output[outputCtr++] = base64Table[(buffer >> 6) & 0x3F];
        output[outputCtr++] = base64Table[buffer & 0x3F];
    }
    if (padding == 1) {
        var buffer = ((dataArr[len] & 0xFF) << 8) | (dataArr[len+1] & 0xFF);
        output[outputCtr++] = base64Table[buffer >> 10];
        output[outputCtr++] = base64Table[(buffer >> 4) & 0x3F];
        output[outputCtr++] = base64Table[(buffer << 2) & 0x3F];
        output[outputCtr++] = base64Table[64];
    } else if (padding == 2) {
        var buffer = dataArr[len] & 0xFF;
        output[outputCtr++] = base64Table[buffer >> 2];
        output[outputCtr++] = base64Table[(buffer << 4) & 0x3F];
        output[outputCtr++] = base64Table[64];
        output[outputCtr++] = base64Table[64];
    }
    
    var ret = decoder.decode(output);
    return ret;
}
