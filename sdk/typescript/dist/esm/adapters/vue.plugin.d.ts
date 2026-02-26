/**
 * Tenlixor Vue Plugin
 * @module @verbytes-tenlixor/sdk/vue
 *
 * Usage:
 * 1. Install the plugin in your main.js/ts
 * 2. Use this.$txr in components or provide/inject pattern
 * 3. Access translations: this.$txr.t('app.welcome')
 */
import { Tenlixor } from '../tenlixor';
import type { TenlixorPluginOptions } from '../types';
import type { Plugin } from 'vue';
/**
 * Vue Plugin Installation Interface
 */
export type TenlixorVuePlugin = Plugin & {
    /** Tenlixor instance */
    instance: Tenlixor;
};
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
export declare function createTenlixorPlugin(options: TenlixorPluginOptions): TenlixorVuePlugin;
export declare function useTenlixor(): Tenlixor;
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
import { Ref } from 'vue';
export interface TenlixorTranslateComposable {
    /** Translation function */
    t: (key: string, languageCode?: string) => string;
    /** Current language (reactive) */
    currentLanguage: Ref<string>;
    /** Change language function */
    setLanguage: (languageCode: string) => Promise<void>;
    /** Available languages (reactive) */
    availableLanguages: Ref<string[]>;
    /** SDK ready state (reactive) */
    isReady: Ref<boolean>;
}
export declare function useTenlixorTranslate(): TenlixorTranslateComposable;
/**
 * Augment Vue types for TypeScript
 */
declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $txr: Tenlixor;
        $t: (key: string, languageCode?: string) => string;
    }
}
//# sourceMappingURL=vue.plugin.d.ts.map