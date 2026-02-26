/**
 * Tenlixor React Hook
 * @module @verbytes-tenlixor/sdk/react
 * 
 * Usage:
 * 1. Wrap your app with TenlixorProvider
 * 2. Use useTenlixor() hook in components
 * 3. Access translations: const { t } = useTenlixor();
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
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
 * Tenlixor React Context
 */
const TenlixorContext = createContext<TenlixorContextValue | null>(null);

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
export const TenlixorProvider: React.FC<TenlixorProviderProps> = ({ config, children }) => {
  const [instance] = useState(() => new Tenlixor(config));
  const [currentLanguage, setCurrentLanguage] = useState(config.language || 'en');
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
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
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
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

    const onLanguageChanged = (data: { from: string; to: string }) => {
      setCurrentLanguage(data.to);
      forceUpdate({}); // Force re-render to update translations
    };

    const onError = (errorData: { code: string; message: string; error?: Error }) => {
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

  const t = useCallback(
    (key: string, languageCode?: string) => {
      return instance.t(key, languageCode);
    },
    [instance, currentLanguage] // Re-create when language changes
  );

  const setLanguage = useCallback(
    async (languageCode: string) => {
      try {
        await instance.setLanguage(languageCode);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to change language'));
        throw err;
      }
    },
    [instance]
  );

  const value: TenlixorContextValue = {
    instance,
    t,
    currentLanguage,
    setLanguage,
    availableLanguages,
    isReady,
    isLoading,
    error
  };

  return <TenlixorContext.Provider value={value}>{children}</TenlixorContext.Provider>;
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
export function useTenlixor(): TenlixorContextValue {
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
export function useTranslate(): (key: string, languageCode?: string) => string {
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
export function useLanguage(): [
  string,
  (languageCode: string) => Promise<void>,
  string[]
] {
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
export function withTenlixor<P extends object>(
  Component: React.ComponentType<P & { tenlixor: TenlixorContextValue }>
): React.FC<Omit<P, 'tenlixor'>> {
  return (props: Omit<P, 'tenlixor'>) => {
    const tenlixor = useTenlixor();
    return <Component {...(props as P)} tenlixor={tenlixor} />;
  };
}
