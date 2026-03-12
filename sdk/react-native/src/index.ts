/**
 * Tenlixor React Native SDK
 * @module @verbytes-tenlixor/react-native
 * 
 * React Native SDK for Tenlixor localization platform with AsyncStorage support
 * 
 * @example
 * ```tsx
 * import { Tenlixor, useTenlixor } from '@verbytes-tenlixor/react-native';
 * 
 * // Create instance
 * const txr = new Tenlixor({
 *   token: 'your-api-token',
 *   tenantSlug: 'your-tenant',
 *   language: 'en',
 *   persistentStorage: true
 * });
 * 
 * // Use in component
 * function App() {
 *   const { t, language, setLanguage, isReady } = useTenlixor(txr);
 * 
 *   if (!isReady) {
 *     return <ActivityIndicator />;
 *   }
 * 
 *   return (
 *     <View>
 *       <Text>{t('app.welcome')}</Text>
 *       <Button title="Switch Language" onPress={() => setLanguage('tr')} />
 *     </View>
 *   );
 * }
 * ```
 */

// Core exports
export { Tenlixor } from './tenlixor';

// Type exports
export type {
  TenlixorConfig,
  TenlixorResource,
  TenlixorLanguage,
  TenlixorResponseData,
  TenlixorResponse,
  TenlixorResponseMeta,
  TenlixorLanguageMap,
  TenlixorDataStore,
  TenlixorCacheEntry,
  TenlixorLoadedEvent,
  TenlixorErrorEvent,
  TenlixorLanguageChangedEvent,
  TenlixorEventType,
  TenlixorEventHandler,
  TenlixorEventListeners,
  TranslateFunction,
  ITenlixor,
  IStorageAdapter
} from './types';

// Hook exports
export { useTenlixor, createTenlixorHook } from './hooks/useTenlixor';
export type { UseTenlixorReturn } from './hooks/useTenlixor';

// Storage exports
export { AsyncStorageAdapter, defaultStorageAdapter } from './storage/AsyncStorageAdapter';
