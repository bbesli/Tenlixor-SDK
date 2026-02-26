/**
 * Tenlixor React Hook
 * @module @verbytes-tenlixor/sdk/react
 *
 * Usage:
 * 1. Wrap your app with TenlixorProvider
 * 2. Use useTenlixor() hook in components
 * 3. Access translations: const { t } = useTenlixor();
 */
import React, { ReactNode } from 'react';
import { Tenlixor } from '../tenlixor';
import type { TenlixorConfig } from '../types';
/**
 * Tenlixor Context Interface
 */
export interface TenlixorContextValue {
    /** Tenlixor instance */
    instance: Tenlixor;
    /** Translation function */
    t: (key: string, languageCode?: string) => string;
    /** Current language */
    currentLanguage: string;
    /** Change language function */
    setLanguage: (languageCode: string) => Promise<void>;
    /** Available languages */
    availableLanguages: string[];
    /** SDK ready state */
    isReady: boolean;
    /** Loading state */
    isLoading: boolean;
    /** Error state */
    error: Error | null;
}
/**
 * Tenlixor Provider Props
 */
export interface TenlixorProviderProps {
    /** Tenlixor configuration */
    config: TenlixorConfig;
    /** Child components */
    children: ReactNode;
}
/**
 * Tenlixor Provider Component
 *
 * @example
 * ```tsx
 * import { TenlixorProvider } from '@verbytes-tenlixor/sdk/react';
 *
 * function App() {
 *   return (
 *     <TenlixorProvider config={{ token: 'YOUR_TOKEN', language: 'en' }}>
 *       <YourApp />
 *     </TenlixorProvider>
 *   );
 * }
 * ```
 */
export declare const TenlixorProvider: React.FC<TenlixorProviderProps>;
/**
 * Tenlixor Hook
 *
 * @returns Tenlixor context value
 * @throws {Error} If used outside TenlixorProvider
 *
 * @example
 * ```tsx
 * import { useTenlixor } from '@verbytes-tenlixor/sdk/react';
 *
 * function MyComponent() {
 *   const { t, currentLanguage, setLanguage, isReady } = useTenlixor();
 *
 *   if (!isReady) {
 *     return <div>Loading translations...</div>;
 *   }
 *
 *   return (
 *     <div>
 *       <h1>{t('app.welcome')}</h1>
 *       <p>Current language: {currentLanguage}</p>
 *       <button onClick={() => setLanguage('tr')}>Switch to Turkish</button>
 *     </div>
 *   );
 * }
 * ```
 */
export declare function useTenlixor(): TenlixorContextValue;
/**
 * Tenlixor Translation Hook (shorthand)
 *
 * @returns Translation function
 *
 * @example
 * ```tsx
 * import { useTranslate } from '@verbytes-tenlixor/sdk/react';
 *
 * function MyComponent() {
 *   const t = useTranslate();
 *
 *   return <h1>{t('app.welcome')}</h1>;
 * }
 * ```
 */
export declare function useTranslate(): (key: string, languageCode?: string) => string;
/**
 * Tenlixor Language Hook
 *
 * @returns Current language and setter
 *
 * @example
 * ```tsx
 * import { useLanguage } from '@verbytes-tenlixor/sdk/react';
 *
 * function LanguageSwitcher() {
 *   const [language, setLanguage, availableLanguages] = useLanguage();
 *
 *   return (
 *     <select value={language} onChange={(e) => setLanguage(e.target.value)}>
 *       {availableLanguages.map(lang => (
 *         <option key={lang} value={lang}>{lang}</option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */
export declare function useLanguage(): [
    string,
    (languageCode: string) => Promise<void>,
    string[]
];
/**
 * Higher-Order Component to inject Tenlixor
 *
 * @param Component - Component to wrap
 * @returns Wrapped component with tenlixor prop
 *
 * @example
 * ```tsx
 * import { withTenlixor } from '@verbytes-tenlixor/sdk/react';
 *
 * function MyComponent({ tenlixor }) {
 *   return <h1>{tenlixor.t('app.welcome')}</h1>;
 * }
 *
 * export default withTenlixor(MyComponent);
 * ```
 */
export declare function withTenlixor<P extends object>(Component: React.ComponentType<P & {
    tenlixor: TenlixorContextValue;
}>): React.FC<Omit<P, 'tenlixor'>>;
//# sourceMappingURL=react.hook.d.ts.map