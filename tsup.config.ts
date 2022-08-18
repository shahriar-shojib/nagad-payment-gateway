import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['./src/index.ts'],
	clean: true,
	dts: true,
	external: ['node-fetch'],
	format: ['cjs', 'esm'],
	minify: false,
	tsconfig: './tsconfig.build.json',
});
