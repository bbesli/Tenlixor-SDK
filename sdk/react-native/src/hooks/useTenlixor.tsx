/**
 * Tenlixor React Native Hooks
 * @module @verbytes-tenlixor/react-native/hooks
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Tenlixor } from '../tenlixor';
import type { TranslateFunction } from '../types';

/**
 * Hook state interface
 */
export interface UseTenlixorReturn {
  /** Translation function */
  t: TranslateFunction;
  /** Current language code */
  language: string;
  /** Available languages */
  availableLanguages: string[];
  /** Is SDK ready/initialized */
  isReady: boolean;
  /** Is currently loading */
  isLoading: boolean;
  /** Change language function */
  setLanguage: (lang: string) => Promise<void>;
  /**Reload strings from API */
  reload: () => Promise<void>;
}

/**
 * React Native hook for using Tenlixor SDK
 * 
 * @param txr - Tenlixor instance
 * @returns Hook state and methods
 * 
 * @example
 * ```tsx
 * import { Tenlixor } from '@verbytes-tenlixor/react-native';
 * import { useTenlixor } from '@verbytes-tenlixor/react-native/hooks';
 * 
 * const txr = new Tenlixor({
 *   token: 'your-token',
 *   tenantSlug: 'your-tenant',
 *   language: 'en'
 * });
 * 
 * function App() {
 *   const { t, language, setLanguage, isReady } = useTenlixor(txr);
 * 
 *   if (!isReady) {
 *     return <Text>Loading...</Text>;
 *   }
 * 
 *   return (
 *     <View>
 *       <Text>{t('app.welcome')}</Text>
 *       <Button title="Switch to TR" onPress={() => setLanguage('tr')} />
 *     </View>
 *   );
 * }
 * ```
 */
export function useTenlixor(txr: Tenlixor): UseTenlixorReturn {
  const [language, setLanguageState] = useState<string>(txr.getLanguage());
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(txr.getAvailableLanguages());
  const [isReady, setIsReady] = useState<boolean>(txr.isReady());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [, forceUpdate] = useState(0);

  // Keep track of mounted state to prevent state updates after unmount
  const isMounted = useRef(true);

  /**
   * Translation function with automatic re-rendering
   */
  const t = useCallback((key: string, languageCode?: string): string => {
    return txr.t(key, languageCode);
  }, [txr]);

  /**
   * Change language with loading state
   */
  const setLanguage = useCallback(async (lang: string): Promise<void> => {
    if (!isMounted.current) return;
    
    setIsLoading(true);
    try {
      await txr.setLanguage(lang);
      if (isMounted.current) {
        setLanguageState(txr.getLanguage());
        setAvailableLanguages(txr.getAvailableLanguages());
      }
    } catch (error) {
      console.error('[Tenlixor] Failed to change language:', error);
      throw error;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [txr]);

  /**
   * Reload strings from API
   */
  const reload = useCallback(async (): Promise<void> => {
    if (!isMounted.current) return;
    
    setIsLoading(true);
    try {
      await txr.reload();
      if (isMounted.current) {
        forceUpdate(prev => prev + 1); // Force re-render
      }
    } catch (error) {
      console.error('[Tenlixor] Failed to reload:', error);
      throw error;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [txr]);

  /**
   * Setup event listeners
   */
  useEffect(() => {
    const handleLoaded = () => {
      if (isMounted.current) {
        setIsReady(true);
        setAvailableLanguages(txr.getAvailableLanguages());
        setIsLoading(false);
        forceUpdate(prev => prev + 1); // Force re-render after load
      }
    };

    const handleLanguageChanged = () => {
      if (isMounted.current) {
        setLanguageState(txr.getLanguage());
        forceUpdate(prev => prev + 1); // Force re-render after language change
      }
    };

    const handleError = (error: any) => {
      if (isMounted.current) {
        setIsLoading(false);
      }
      console.error('[Tenlixor] SDK Error:', error);
    };

    // Register event listeners
    txr.on('loaded', handleLoaded);
    txr.on('language-changed', handleLanguageChanged);
    txr.on('error', handleError);

    // Initialize if not ready
    if (!txr.isReady()) {
      setIsLoading(true);
      txr.init().catch(error => {
        console.error('[Tenlixor] Initialization failed:', error);
        if (isMounted.current) {
          setIsLoading(false);
        }
      });
    } else {
      setIsReady(true);
      setAvailableLanguages(txr.getAvailableLanguages());
    }

    // Cleanup
    return () => {
      isMounted.current = false;
      txr.off('loaded', handleLoaded);
      txr.off('language-changed', handleLanguageChanged);
      txr.off('error', handleError);
    };
  }, [txr]);

  return {
    t,
    language,
    availableLanguages,
    isReady,
    isLoading,
    setLanguage,
    reload
  };
}

/**
 * Create a global Tenlixor instance hook
 * This is useful when you want to use the same instance across your app
 * 
 * @returns Hook function
 * 
 * @example
 * ```tsx
 * // Create global instance
 * import { Tenlixor } from '@verbytes-tenlixor/react-native';
 * import { createTenlixorHook } from '@verbytes-tenlixor/react-native/hooks';
 * 
 * const txr = new Tenlixor({
 *   token: 'your-token',
 *   tenantSlug: 'your-tenant'
 * });
 * 
 * export const useTenlixorGlobal = createTenlixorHook(txr);
 * 
 * // Use in components
 * function MyComponent() {
 *   const { t } = useTenlixorGlobal();
 *   return <Text>{t('hello')}</Text>;
 * }
 * ```
 */
export function createTenlixorHook(txr: Tenlixor): () => UseTenlixorReturn {
  return () => useTenlixor(txr);
}
