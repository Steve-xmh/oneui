import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import css from 'rollup-plugin-css-only';
import typescript from '@rollup/plugin-typescript';
import sveltePreprocess from 'svelte-preprocess';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';
import { preprocess } from './svelte.config';
import ignore from 'rollup-plugin-ignore';
import { builtinModules } from "module";

const production = !process.env.ROLLUP_WATCH;

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

export default {
	input: 'src/index.ts',
	external: ['AMR'],
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'oneui',
		file: 'public/build/bundle.js',
		globals: {
			'amr': 'AMR'
		}
	},
	plugins: [
		svelte({
			preprocess,
			emitCss: false,
			compilerOptions: {
				dev: !production
			}
		}),
		ignore(builtinModules, { commonjsBugFix: true }),
		// we'll extract any component CSS out into
		// a separate file - better for performance
		css({ output: 'bundle.css' }),
		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
		commonjs(),
        typescript({
			sourceMap: true
		}),

		webWorkerLoader({
			loadPath: 'build',
			inline: false
		}),

		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('public'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	}
};