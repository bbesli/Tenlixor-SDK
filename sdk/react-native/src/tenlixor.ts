/**
 * Tenlixor React Native SDK - Core Class
 * @module @verbytes-tenlixor/react-native
 */

import type {
  TenlixorConfig,
  TenlixorDataStore,
  TenlixorResponseData,
  TenlixorResponse,
  TenlixorEventType,
  TenlixorEventHandler,
  TenlixorEventListeners,
  TenlixorCacheEntry,
  ITenlixor,
  IStorageAdapter
} from './types';
import { defaultStorageAdapter } from './storage/AsyncStorageAdapter';

/**
 * Main Tenlixor React Native SDK Class
 */
export class Tenlixor implements ITenlixor {
  private config: Required<TenlixorConfig>;
  private data: TenlixorDataStore;
  private listeners: TenlixorEventListeners;
  private isInitialized: boolean;
  private currentLanguage: string;
  private isLoading: boolean;
  private memoryCache: Map<string, TenlixorCacheEntry>;
  private storage: IStorageAdapter;

  /**
   * Create a new Tenlixor instance
   * @param config - Configuration object
   * @param storageAdapter - Storage adapter (optional, defaults to AsyncStorage)
   * @throws {Error} If API token is not provided
   */
  constructor(config: TenlixorConfig, storageAdapter?: IStorageAdapter) {
    if (!config.token) {
      throw new Error('Tenlixor: API token is required');
    }
    if (!config.tenantSlug) {
      throw new Error('Tenlixor: tenantSlug is required');
    }

    this.config = {
      token: config.token,
      tenantSlug: config.tenantSlug,
      language: config.language || 'en',
      apiUrl: config.apiUrl || 'https://api-tenlixor.verbytes.com/api/v1/strings',
      persistentStorage: config.persistentStorage !== false,
      storageKey: config.storageKey || '@tenlixor',
      cacheTTL: config.cacheTTL || 300000, // 5 minutes
      fallbackLanguage: config.fallbackLanguage || 'en'
    };

    this.data = {
      tenant_id: null,
      languages: {}
    };

    this.listeners = {
      loaded: [],
      error: [],
      'language-changed': []
    };

    this.isInitialized = false;
    this.currentLanguage = this.config.language;
    this.isLoading = false;
    this.memoryCache = new Map();
    this.storage = storageAdapter || defaultStorageAdapter;
  }

  /**
   * Initialize SDK: try to load from storage, then fetch from API
   */
  public async init(): Promise<void> {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    try {
      // Try to load from persistent storage first
      if (this.config.persistentStorage) {
        const storedData = await this.loadFromStorage(this.currentLanguage);
        if (storedData) {
          this.mergeData(storedData);
          this.isInitialized = true;
          this.emit('loaded', { language: this.currentLanguage, fromStorage: true });
        }
      }

      // Fetch fresh data from API
      await this.fetchStrings(this.currentLanguage);
      this.isInitialized = true;
      this.emit('loaded', { language: this.currentLanguage, fromStorage: false });
    } catch (error) {
      // If we loaded from storage, we can continue even if API fails
      if (this.isInitialized) {
        console.warn('[Tenlixor] API fetch failed, using stored data', error);
      } else {
        this.emit('error', {
          code: 'INIT_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
          error: error instanceof Error ? error : undefined
        });
      }
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Fetch strings from API for a specific language
   * @param languageCode - Language code to fetch
   * @returns Fetched data
   */
  private async fetchStrings(languageCode: string): Promise<TenlixorResponseData> {
    // Check memory cache first
    const cached = this.getFromMemoryCache(languageCode);
    if (cached) {
      this.mergeData(cached);
      return cached;
    }

    try {
      const url = `${this.config.apiUrl}?language_code=${encodeURIComponent(languageCode)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Tenant-Slug': this.config.tenantSlug,
          'X-API-Key': this.config.token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('UNAUTHORIZED: Invalid API token');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: TenlixorResponse = await response.json();

      if (!result.success) {
        throw new Error('API returned success: false');
      }

      // Store tenant_id
      if (result.data.tenant_id) {
        this.data.tenant_id = result.data.tenant_id;
      }

      // Process data
      this.mergeData(result.data);

      // Save to persistent storage
      if (this.config.persistentStorage) {
        await this.saveToStorage(languageCode, result.data);
      }

      // Save to memory cache
      this.saveToMemoryCache(languageCode, result.data);

      return result.data;
    } catch (error) {
      // Try to use stored data on network error
      if (this.config.persistentStorage) {
        const storedData = await this.loadFromStorage(languageCode);
        if (storedData) {
          this.mergeData(storedData);
          return storedData;
        }
      }
      throw error;
    }
  }

  /**
   * Merge fetched data into internal storage
   * @param data - Data from API
   */
  private mergeData(data: TenlixorResponseData): void {
    if (data.languages && Array.isArray(data.languages)) {
      data.languages.forEach(lang => {
        const keyValueMap: { [key: string]: string } = {};
        if (lang.resources && Array.isArray(lang.resources)) {
          lang.resources.forEach(resource => {
            keyValueMap[resource.key] = resource.value;
          });
        }
        this.data.languages[lang.code] = keyValueMap;
      });
    }
  }

  /**
   * Translate a key to its value
   * @param key - Translation key (e.g., 'app.welcome')
   * @param languageCode - Language code (optional, uses current language)
   * @returns Translated value or key if not found
   */
  public t(key: string, languageCode?: string): string {
    const lang = languageCode || this.currentLanguage;

    // Try current language
    if (this.data.languages[lang] && this.data.languages[lang][key]) {
      return this.data.languages[lang][key];
    }

    // Try fallback language
    if (lang !== this.config.fallbackLanguage) {
      if (this.data.languages[this.config.fallbackLanguage] &&
        this.data.languages[this.config.fallbackLanguage][key]) {
        return this.data.languages[this.config.fallbackLanguage][key];
      }
    }

    // Return key as fallback (no error thrown)
    return key;
  }

  /**
   * Change active language
   * @param languageCode - New language code
   */
  public async setLanguage(languageCode: string): Promise<void> {
    if (languageCode === this.currentLanguage) {
      return;
    }

    const previousLanguage = this.currentLanguage;
    this.currentLanguage = languageCode;

    try {
      await this.fetchStrings(languageCode);
      this.emit('language-changed', {
        from: previousLanguage,
        to: languageCode
      });
    } catch (error) {
      this.currentLanguage = previousLanguage;
      this.emit('error', {
        code: 'LANGUAGE_CHANGE_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error instanceof Error ? error : undefined
      });
      throw error;
    }
  }

  /**
   * Reload strings from API (bypass cache)
   */
  public async reload(): Promise<void> {
    // Clear memory cache for current language
    this.clearMemoryCache(this.currentLanguage);

    // Clear persistent storage for current language
    if (this.config.persistentStorage) {
      await this.removeFromStorage(this.currentLanguage);
    }

    await this.fetchStrings(this.currentLanguage);
    this.emit('loaded', { language: this.currentLanguage, reloaded: true });
  }

  /**
   * Clear all persistent storage data
   */
  public async clearStorage(): Promise<void> {
    try {
      const keysToRemove = await this.getAllStorageKeys();
      for (const key of keysToRemove) {
        await this.storage.removeItem(key);
      }
      this.memoryCache.clear();
    } catch (error) {
      console.error('[Tenlixor] Failed to clear storage', error);
      throw error;
    }
  }

  /**
   * Register event listener
   * @param event - Event name
   * @param callback - Callback function
   */
  public on(event: TenlixorEventType, callback: TenlixorEventHandler): void {
    if (this.listeners[event] && typeof callback === 'function') {
      this.listeners[event].push(callback);
    }
  }

  /**
   * Unregister event listener
   * @param event - Event name
   * @param callback - Callback function to remove
   */
  public off(event: TenlixorEventType, callback: TenlixorEventHandler): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback) as any;
    }
  }

  /**
   * Emit event to all registered listeners
   * @param event - Event name
   * @param data - Event data
   */
  private emit(event: TenlixorEventType, data: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[Tenlixor] Error in ${event} listener:`, error);
        }
      });
    }
  }

  /**
   * Load data from persistent storage
   * @param languageCode - Language code
   * @returns Stored data or null
   */
  private async loadFromStorage(languageCode: string): Promise<TenlixorResponseData | null> {
    try {
      const storageKey = this.getStorageKey(languageCode);
      const stored = await this.storage.getItem(storageKey);
      
      if (stored) {
        const parsed: TenlixorCacheEntry = JSON.parse(stored);
        
        // Check TTL
        if (Date.now() - parsed.timestamp < this.config.cacheTTL) {
          return parsed.data;
        }
      }
    } catch (error) {
      console.warn('[Tenlixor] Storage read error:', error);
    }

    return null;
  }

  /**
   * Save data to persistent storage
   * @param languageCode - Language code
   * @param data - Data to save
   */
  private async saveToStorage(languageCode: string, data: TenlixorResponseData): Promise<void> {
    try {
      const storageKey = this.getStorageKey(languageCode);
      const cacheData: TenlixorCacheEntry = {
        timestamp: Date.now(),
        data: data
      };
      
      await this.storage.setItem(storageKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('[Tenlixor] Storage write error:', error);
    }
  }

  /**
   * Remove data from persistent storage
   * @param languageCode - Language code
   */
  private async removeFromStorage(languageCode: string): Promise<void> {
    try {
      const storageKey = this.getStorageKey(languageCode);
      await this.storage.removeItem(storageKey);
    } catch (error) {
      console.warn('[Tenlixor] Storage remove error:', error);
    }
  }

  /**
   * Get all storage keys for this tenant
   * @returns Array of storage keys
   */
  private async getAllStorageKeys(): Promise<string[]> {
    const prefix = `${this.config.storageKey}_${this.data.tenant_id || 'default'}_`;
    
    // If storage adapter has a method to get keys with prefix, use it
    if ('getKeysWithPrefix' in this.storage && typeof (this.storage as any).getKeysWithPrefix === 'function') {
      return await (this.storage as any).getKeysWithPrefix(prefix);
    }
    
    // Otherwise, return empty array (will have to clear manually)
    return [];
  }

  /**
   * Get data from memory cache
   * @param languageCode - Language code
   * @returns Cached data or null
   */
  private getFromMemoryCache(languageCode: string): TenlixorResponseData | null {
    const cacheKey = this.getCacheKey(languageCode);
    const cached = this.memoryCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.config.cacheTTL) {
      return cached.data;
    }

    return null;
  }

  /**
   * Save data to memory cache
   * @param languageCode - Language code
   * @param data - Data to cache
   */
  private saveToMemoryCache(languageCode: string, data: TenlixorResponseData): void {
    const cacheKey = this.getCacheKey(languageCode);
    this.memoryCache.set(cacheKey, {
      timestamp: Date.now(),
      data: data
    });
  }

  /**
   * Clear memory cache for a language
   * @param languageCode - Language code
   */
  private clearMemoryCache(languageCode: string): void {
    const cacheKey = this.getCacheKey(languageCode);
    this.memoryCache.delete(cacheKey);
  }

  /**
   * Generate storage key
   * @param languageCode - Language code
   * @returns Storage key
   */
  private getStorageKey(languageCode: string): string {
    const tenantId = this.data.tenant_id || 'default';
    return `${this.config.storageKey}_${tenantId}_${languageCode}`;
  }

  /**
   * Generate cache key for memory cache
   * @param languageCode - Language code
   * @returns Cache key
   */
  private getCacheKey(languageCode: string): string {
    const tenantId = this.data.tenant_id || 'default';
    return `txr_${tenantId}_${languageCode}`;
  }

  /**
   * Get current language
   * @returns Current language code
   */
  public getLanguage(): string {
    return this.currentLanguage;
  }

  /**
   * Get all available languages
   * @returns Array of language codes
   */
  public getAvailableLanguages(): string[] {
    return Object.keys(this.data.languages);
  }

  /**
   * Check if SDK is initialized
   * @returns Initialization status
   */
  public isReady(): boolean {
    return this.isInitialized;
  }
}
