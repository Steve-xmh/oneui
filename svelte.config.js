import sveltePreprocess from 'svelte-preprocess';

export const preprocess = sveltePreprocess({
    scss: {
        includePaths: ['theme'],
    },
    typescript: true
})