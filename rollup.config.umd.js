import config from './rollup.config';

config.format = 'umd';
config.dest = 'dist/localforage-plugin-boilerplate.js';
config.moduleName = 'localforagePluginBoilerplate';

export default config;
