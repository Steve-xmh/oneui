const childproc = require('child_process')
const fs = require('fs')
const { resolve } = require('path')

fs.rmSync(resolve(__dirname, 'pkg'), { recursive: true, force: true })
fs.mkdirSync(resolve(__dirname, 'pkg'))

const args = [
    'emcc',
    '-Os',
    '--closure 1',
    '--pre-js=src/pre.js',
    '-s ENVIRONMENT=worker',
    '-s WASM=1',
    '-s STRICT_JS=0',
    '-s INVOKE_RUN=1',
//    '-s MODULARIZE=1',
//    '-s SINGLE_FILE=1',
    '-s USE_GLFW=0',
    '-s USE_SDL=0',
    '-s EXPORT_NAME=SilkSDK',
//    '-s EXPORT_ES6=1',
    '-s EXPORT_ALL=1',
    '-s ALLOW_MEMORY_GROWTH=1',
    '-s BUILD_AS_WORKER=1',
    `-s EXTRA_EXPORTED_RUNTIME_METHODS="['FS','callMain']"`,
    '-flto',
    '-I',
    'src/interface',
    '-I',
    'src/src',
    '-I',
    'src/test',
    '-o',
    'pkg/silksdk.js',
]

for (const file of fs.readdirSync(resolve(__dirname, 'src/src'))) {
    if (file.endsWith('.c')) args.push('src/src/' + file)
}

args.push('src/test/Decoder.c')

console.log('Compiling Silk SDK using command:')
console.log(args.join(' '))

const result = childproc.spawnSync(args.join(' '), {
    cwd: __dirname,
    shell: true,
    stdio: 'pipe',
    encoding: 'utf8'
})

if (result.status !== 0) {
    console.error(result.error)
    console.error(result.stderr)
}

process.exit(result.status)
