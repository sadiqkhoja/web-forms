import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { fileURLToPath, URL } from 'node:url';
import { resolve } from 'path';
import { defineConfig, UserConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig((env) => {

	const config:UserConfig = {
		base: './',
		plugins: [vue(), vueJsx(), cssInjectedByJsPlugin()],
		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./src', import.meta.url)),
				'primevue/menuitem': 'primevue/menu',
				// Icomoon and Roboto fonts
				'/fonts': resolve('./src/assets/fonts'),
			},
		},
		build: {
			assetsInlineLimit: () => true,
			target: 'esnext',
			lib: {
				formats: ['es'],
				entry: resolve(__dirname, 'src/index.ts'),
				name: 'OdkWebForms',
				fileName: 'index',
			},
			rollupOptions: {
				external: ['vue'],
				output: {
					globals: {
						vue: 'Vue',
					},
				},
			},
		},
		css: {
			postcss: {
				plugins: [
					/**
					 * primevue-sass-theme defines styles within a `@layer primevue { ...
					 * }`. With that approach, host applications rules have higher
					 * precedence, which could potentially override Web Forms styles in
					 * unpredictable ways. This plugin unwraps that `@layer`, replacing it
					 * with the style rules it contains.
					 */
					{
						postcssPlugin: 'unwrap-at-layer-rules',
						Once(root) {
							root.walkAtRules((rule) => {
								if (rule.name === 'layer') {
									if (rule.parent == null) {
										throw new Error('Failed to unwrap @layer: rule has no parent');
									}

									rule.parent.append(rule.nodes);
									rule.remove();
								}
							});
						},
					},
				],
			},
		},
	};

	if(env.mode === 'demo') {
		const {lib, rollupOptions, ...build} = config.build!;
		config.build = build;
	}

	return config;
});
