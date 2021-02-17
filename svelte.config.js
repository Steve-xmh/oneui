import sveltePreprocess from 'svelte-preprocess';

const production = !process.env.ROLLUP_WATCH;

export const preprocess = sveltePreprocess({
    scss: {
        includePaths: ['theme'],
    },
    typescript: true,
    sourceMap: !production
})