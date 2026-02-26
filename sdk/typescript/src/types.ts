/**
 * Tenlixor SDK Type Definitions
 * @module @verbytes-tenlixor/sdk
 */

/**
 * SDK Configuration Interface
 */
export interface TenlixorConfig {
  /** API authentication token (required) */
  token: string;
  /** Tenant slug identifier (required) */
  tenantSlug: string;
  /** Default language code */
  language?: string;
  /** API base URL */
  apiUrl?: string;
  /** Enable caching */
  cache?: boolean;
  /** Cache time-to-live in milliseconds (default: 300000 = 5 minutes) */
  cacheTTL?: number;
  /** Fallback language if translation not found */
  fallbackLanguage?: string;
  /** Automatically scan DOM on initialization */
  autoScan?: boolean;
}

/**
 * Translation Resource Interface
 */
export interface TenlixorResource {
  /** Unique resource identifier */
  id: string;
  /** Translation key (e.g., 'app.welcome') */
  key: string;
  /** Translated value */
  value: string;
  /** Optional description */
  description: string;
  /** User who created the resource */
  created_by: string | null;
  /** User who last updated the resource */
  updated_by: string | null;
  /** Creation timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at: string;
}

/**
 * Language Data Interface
 */
export interface TenlixorLanguage {
  /** Language code (e.g., 'en', 'tr') */
  code: string;
  /** Array of translation resources */
  resources: TenlixorResource[];
}

/**
 * API Response Data Interface
 */
export interface TenlixorResponseData {
  /** Tenant identifier */
  tenant_id: string;
  /** Array of languages with their resources */
  languages: TenlixorLanguage[];
}

/**
 * API Response Metadata Interface
 */
export interface TenlixorResponseMeta {
  /** Current page number */
  page: number;
  /** Items per page */
  limit: number;
  /** Total number of items */
  total: number;
}

/**
 * Complete API Response Interface
 */
export interface TenlixorResponse {
  /** Success status */
  success: boolean;
  /** Response data */
  data: TenlixorResponseData;
  /** Response metadata */
  meta: TenlixorResponseMeta;
  /** Unique request identifier */
  request_id: string;
}

/**
 * Internal Language Map (key-value pairs)
 */
export interface TenlixorLanguageMap {
  [key: string]: string;
}

/**
 * Internal Data Storage Interface
 */
export interface TenlixorDataStore {
  tenant_id: string | null;
  languages: {
    [languageCode: string]: TenlixorLanguageMap;
  };
}

/**
 * Cache Entry Interface
 */
export interface TenlixorCacheEntry {
  /** Cache timestamp */
  timestamp: number;
  /** Cached data */
  data: TenlixorResponseData;
}

/**
 * Event Data Interfaces
 */
export interface TenlixorLoadedEvent {
  /** Language code that was loaded */
  language: string;
  /** Whether this was a reload operation */
  reloaded?: boolean;
}

export interface TenlixorErrorEvent {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Original error object */
  error?: Error;
}

export interface TenlixorLanguageChangedEvent {
  /** Previous language code */
  from: string;
  /** New language code */
  to: string;
}

/**
 * Event Types Union
 */
export type TenlixorEventType = 'loaded' | 'error' | 'language-changed';

/**
 * Event Handler Type
 */
export type TenlixorEventHandler<T = any> = (data: T) => void;

/**
 * Event Listeners Map
 */
export interface TenlixorEventListeners {
  loaded: TenlixorEventHandler<TenlixorLoadedEvent>[];
  error: TenlixorEventHandler<TenlixorErrorEvent>[];
  'language-changed': TenlixorEventHandler<TenlixorLanguageChangedEvent>[];
}

/**
 * Translation Function Type
 */
export type TranslateFunction = (key: string, languageCode?: string) => string;

/**
 * SDK Instance Interface
 */
export interface ITenlixor {
  /** Initialize SDK */
  init(): Promise<void>;
  /** Translate a key */
  t(key: string, languageCode?: string): string;
  /** Change active language */
  setLanguage(languageCode: string): Promise<void>;
  /** Reload strings from API */
  reload(): Promise<void>;
  /** Manually scan DOM */
  scan(): void;
  /** Register event listener */
  on(event: TenlixorEventType, callback: TenlixorEventHandler): void;
  /** Unregister event listener */
  off(event: TenlixorEventType, callback: TenlixorEventHandler): void;
  /** Get current language */
  getLanguage(): string;
  /** Get available languages */
  getAvailableLanguages(): string[];
  /** Check if SDK is ready */
  isReady(): boolean;
}

/**
 * Framework Plugin Options
 */
export interface TenlixorPluginOptions extends TenlixorConfig {
  /** Custom instance name (for Vue plugin) */
  instanceName?: string;
}
