"use strict";
/**
 * Tenlixor Vue Plugin
 * @module @verbytes-tenlixor/sdk/vue
 *
 * Usage:
 * 1. Install the plugin in your main.js/ts
 * 2. Use this.$txr in components or provide/inject pattern
 * 3. Access translations: this.$txr.t('app.welcome')
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTenlixorPlugin = createTenlixorPlugin;
exports.useTenlixor = useTenlixor;
exports.useTenlixorTranslate = useTenlixorTranslate;
const tenlixor_1 = require("../tenlixor");
/**
 * Create Tenlixor Vue Plugin
 *
 * @param options - Tenlixor configuration options
 * @returns Vue plugin
 *
 * @example
 * ```typescript
 * // Vue 3
 * import { createApp } from 'vue';
 * import { createTenlixorPlugin } from '@verbytes-tenlixor/sdk/vue';
 *
 * const app = createApp(App);
 *
 * const tenlixorPlugin = createTenlixorPlugin({
 *   token: 'YOUR_API_TOKEN',
 *   language: 'en'
 * });
 *
 * app.use(tenlixorPlugin);
 *
 * // In components:
 * export default {
 *   mounted() {
 *     console.log(this.$txr.t('app.welcome'));
 *   }
 * }
 * ```
 */
function createTenlixorPlugin(options) {
    const instanceName = options.instanceName || '$txr';
    const tenlixorInstance = new tenlixor_1.Tenlixor(options);
    // Initialize on plugin creation
    tenlixorInstance.init().catch(error => {
        console.error('Tenlixor Vue Plugin: Initialization failed', error);
    });
    const plugin = {
        instance: tenlixorInstance,
        install(app) {
            // Make Tenlixor instance available globally
            app.config.globalProperties[instanceName] = tenlixorInstance;
            // Provide for composition API
            app.provide('tenlixor', tenlixorInstance);
            // Register global helper
            app.config.globalProperties.$t = (key, languageCode) => {
                return tenlixorInstance.t(key, languageCode);
            };
        }
    };
    return plugin;
}
/**
 * Vue 3 Composition API Hook
 *
 * @returns Tenlixor instance
 *
 * @example
 * ```typescript
 * import { useTenlixor } from '@verbytes-tenlixor/sdk/vue';
 *
 * export default {
 *   setup() {
 *     const txr = useTenlixor();
 *
 *     const greeting = computed(() => txr.t('app.welcome'));
 *
 *     const switchLanguage = async () => {
 *       await txr.setLanguage('tr');
 *     };
 *
 *     return { greeting, switchLanguage };
 *   }
 * }
 * ```
 */
const vue_1 = require("vue");
function useTenlixor() {
    const instance = (0, vue_1.inject)('tenlixor');
    if (!instance) {
        throw new Error('Tenlixor: Plugin not installed. Use app.use(createTenlixorPlugin(...))');
    }
    return instance;
}
/**
 * Vue 3 Reactive Translation Composable
 *
 * @returns Translation helpers with reactivity
 *
 * @example
 * ```typescript
 * import { useTenlixorTranslate } from '@verbytes-tenlixor/sdk/vue';
 *
 * export default {
 *   setup() {
 *     const { t, currentLanguage, setLanguage } = useTenlixorTranslate();
 *
 *     return {
 *       greeting: computed(() => t('app.welcome')),
 *       currentLanguage,
 *       setLanguage
 *     };
 *   }
 * }
 * ```
 */
const vue_2 = require("vue");
function useTenlixorTranslate() {
    const txr = useTenlixor();
    const currentLanguage = (0, vue_2.ref)(txr.getLanguage());
    const availableLanguages = (0, vue_2.ref)(txr.getAvailableLanguages());
    const isReady = (0, vue_2.ref)(txr.isReady());
    // Update reactive refs on language change
    txr.on('language-changed', (data) => {
        currentLanguage.value = data.to;
    });
    // Update ready state on load
    txr.on('loaded', () => {
        isReady.value = true;
        availableLanguages.value = txr.getAvailableLanguages();
    });
    const setLanguage = async (languageCode) => {
        await txr.setLanguage(languageCode);
        currentLanguage.value = languageCode;
    };
    const t = (key, languageCode) => {
        return txr.t(key, languageCode);
    };
    return {
        t,
        currentLanguage,
        setLanguage,
        availableLanguages,
        isReady
    };
}
//# sourceMappingURL=vue.plugin.js.map