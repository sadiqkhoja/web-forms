import type { Component } from 'vue';
import { createApp, ref } from 'vue';

import { webFormsPlugin } from '../WebFormsPlugin';
import OdkWebFormDemo from './OdkWebFormDemo.vue';

import icomoon from '../assets/css/icomoon.css?inline';
import theme from '../themes/2024-light/theme.scss?inline';
// TODO/sk: Purge it - postcss-purgecss
import primeflex from 'primeflex/primeflex.css?inline';

import demoStyles from '../assets/css/style.scss?inline';
import router from './router';

const styles = [icomoon, theme, primeflex, demoStyles].join('\n\n');
const stylesheet = new CSSStyleSheet();

stylesheet.replaceSync(styles);

document.adoptedStyleSheets.push(stylesheet);
const uploadedFile = ref();
const app = createApp(OdkWebFormDemo as Component);
app.use(webFormsPlugin);
app.use(router);
app.provide('uploadedFile', uploadedFile);
app.mount('#app');
