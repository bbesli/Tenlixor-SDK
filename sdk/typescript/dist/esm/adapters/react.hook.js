import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Tenlixor React Hook
 * @module @verbytes-tenlixor/sdk/react
 *
 * Usage:
 * 1. Wrap your app with TenlixorProvider
 * 2. Use useTenlixor() hook in components
 * 3. Access translations: const { t } = useTenlixor();
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Tenlixor } from '../tenlixor';
/**
 * Tenlixor React Context
 */
const TenlixorContext = createContext(null);
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
export const TenlixorProvider = ({ config, children }) => {
    const [instance] = useState(() => new Tenlixor(config));
    const [currentLanguage, setCurrentLanguage] = useState(config.language || 'en');
    const [availableLanguages, setAvailableLanguages] = useState([]);
    const [isReady, setIsReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [, forceUpdate] = useState({});
    useEffect(() => {
        // Initialize SDK
        const initializeSdk = async () => {
            try {
                setIsLoading(true);
                await instance.init();
                setIsReady(true);
                setAvailableLanguages(instance.getAvailableLanguages());
                setError(null);
            }
            catch (err) {
                setError(err instanceof Error ? err : new Error('Unknown error'));
            }
            finally {
                setIsLoading(false);
            }
        };
        initializeSdk();
        // Event listeners
        const onLoaded = () => {
            setIsReady(true);
            setAvailableLanguages(instance.getAvailableLanguages());
            forceUpdate({}); // Force re-render to update translations
        };
        const onLanguageChanged = (data) => {
            setCurrentLanguage(data.to);
            forceUpdate({}); // Force re-render to update translations
        };
        const onError = (errorData) => {
            setError(errorData.error || new Error(errorData.message));
        };
        instance.on('loaded', onLoaded);
        instance.on('language-changed', onLanguageChanged);
        instance.on('error', onError);
        // Cleanup
        return () => {
            instance.off('loaded', onLoaded);
            instance.off('language-changed', onLanguageChanged);
            instance.off('error', onError);
        };
    }, [instance]);
    const t = useCallback((key, languageCode) => {
        return instance.t(key, languageCode);
    }, [instance, currentLanguage] // Re-create when language changes
    );
    const setLanguage = useCallback(async (languageCode) => {
        try {
            await instance.setLanguage(languageCode);
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to change language'));
            throw err;
        }
    }, [instance]);
    const value = {
        instance,
        t,
        currentLanguage,
        setLanguage,
        availableLanguages,
        isReady,
        isLoading,
        error
    };
    return _jsx(TenlixorContext.Provider, { value: value, children: children });
};
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
export function useTenlixor() {
    const context = useContext(TenlixorContext);
    if (!context) {
        throw new Error('useTenlixor must be used within a TenlixorProvider');
    }
    return context;
}
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
export function useTranslate() {
    const { t } = useTenlixor();
    return t;
}
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
export function useLanguage() {
    const { currentLanguage, setLanguage, availableLanguages } = useTenlixor();
    return [currentLanguage, setLanguage, availableLanguages];
}
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
export function withTenlixor(Component) {
    return (props) => {
        const tenlixor = useTenlixor();
        return _jsx(Component, { ...props, tenlixor: tenlixor });
    };
}
//# sourceMappingURL=react.hook.js.map