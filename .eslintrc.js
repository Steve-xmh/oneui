export default {
    env: {
        es6: true,
        node: true
    },
    extends: [
        standard
    ],
    globals: {
        Atomics: readonly,
        SharedArrayBuffer: readonly
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
    },
    plugins: [
        '@typescript-eslint'
    ],
    rules: {
        indent: [1, 4]
    }
}