/**
 * Tenlixor TypeScript SDK - Core Class
 * @module @verbytes-tenlixor/sdk
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
  ITenlixor
} from './types';

/**
 * Main Tenlixor SDK Class
 */
export class Tenlixor implements ITenlixor {
  private config: Required<TenlixorConfig>;
  private data: TenlixorDataStore;
  private listeners: TenlixorEventListeners;
  private isInitialized: boolean;
  private currentLanguage: string;
  private isLoading: boolean;
  private memoryCache: Map<string, TenlixorCacheEntry>;

  /**
   * Create a new Tenlixor instance
   * @param config - Configuration object
   * @throws {Error} If API token is not provided
   */
  constructor(config: TenlixorConfig) {
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
      cache: config.cache !== false,
      cacheTTL: config.cacheTTL || 300000, // 5 minutes
      fallbackLanguage: config.fallbackLanguage || 'en',
      autoScan: config.autoScan !== false
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
  }

  /**
   * Initialize SDK: fetch strings and optionally scan DOM
   */
  public async init(): Promise<void> {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    try {
      await this.fetchStrings(this.currentLanguage);
      this.isInitialized = true;

      if (this.config.autoScan) {
        if (typeof document !== 'undefined') {
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.scan());
          } else {
            this.scan();
          }
        }
      }

      this.emit('loaded', { language: this.currentLanguage });
    } catch (error) {
      this.emit('error', {
        code: 'INIT_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error instanceof Error ? error : undefined
      });
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
    // Check cache first
    if (this.config.cache) {
      const cached = this.getFromCache(languageCode);
      if (cached) {
        this.mergeData(cached);
        return cached;
      }
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

      // Process and cache data
      this.mergeData(result.data);

      if (this.config.cache) {
        this.saveToCache(languageCode, result.data);
      }

      return result.data;
    } catch (error) {
      // Try to use cached data on network error
      if (this.config.cache) {
        const cached = this.getFromCache(languageCode, true); // Ignore TTL
        if (cached) {
          this.mergeData(cached);
          return cached;
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
   * Change active language and re-scan DOM
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
      this.scan();
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
    // Clear cache for current language
    if (this.config.cache) {
      this.clearCache(this.currentLanguage);
    }

    await this.fetchStrings(this.currentLanguage);
    this.scan();
    this.emit('loaded', { language: this.currentLanguage, reloaded: true });
  }

  /**
   * Manually scan and translate DOM elements
   */
  public scan(): void {
    if (!this.isInitialized || typeof document === 'undefined') {
      return;
    }

    const lang = this.currentLanguage;

    // Scan elements with data-txr-key attribute
    const elementsWithAttr = document.querySelectorAll('[data-txr-key]');
    elementsWithAttr.forEach(element => {
      const key = element.getAttribute('data-txr-key');
      if (key && !element.hasAttribute('data-txr-resolved')) {
        const value = this.t(key, lang);
        element.textContent = value;
        element.setAttribute('data-txr-resolved', 'true');
        element.setAttribute('data-txr-lang', lang);
      } else if (key && element.getAttribute('data-txr-lang') !== lang) {
        // Re-translate if language changed
        const value = this.t(key, lang);
        element.textContent = value;
        element.setAttribute('data-txr-lang', lang);
      }
    });

    // Scan text nodes for exact key matches
    this.scanTextNodes(document.body, lang);
  }

  /**
   * Recursively scan text nodes for translation keys
   * @param node - Root node to scan
   * @param lang - Language code
   */
  private scanTextNodes(node: Node, lang: string): void {
    if (!node) return;

    // Skip already processed elements
    if (node.nodeType === Node.ELEMENT_NODE &&
      (node as Element).hasAttribute('data-txr-resolved')) {
      return;
    }

    // Process text nodes
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim() || '';
      if (text && this.data.languages[lang] && this.data.languages[lang][text]) {
        const value = this.t(text, lang);
        node.textContent = value;

        // Mark parent element as resolved
        if (node.parentElement) {
          node.parentElement.setAttribute('data-txr-resolved', 'true');
          node.parentElement.setAttribute('data-txr-key', text);
          node.parentElement.setAttribute('data-txr-lang', lang);
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Skip script, style, and other non-visible elements
      const tagName = (node as Element).tagName.toLowerCase();
      if (tagName !== 'script' && tagName !== 'style' && tagName !== 'noscript') {
        node.childNodes.forEach(child => this.scanTextNodes(child, lang));
      }
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
          console.error(`Tenlixor: Error in ${event} listener:`, error);
        }
      });
    }
  }

  /**
   * Get data from cache
   * @param languageCode - Language code
   * @param ignoreTTL - Ignore TTL check
   * @returns Cached data or null
   */
  private getFromCache(languageCode: string, ignoreTTL: boolean = false): TenlixorResponseData | null {
    const cacheKey = this.getCacheKey(languageCode);

    try {
      // Try localStorage first
      if (typeof localStorage !== 'undefined') {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed: TenlixorCacheEntry = JSON.parse(cached);
          if (ignoreTTL || Date.now() - parsed.timestamp < this.config.cacheTTL) {
            return parsed.data;
          }
        }
      }

      // Fallback to in-memory cache
      const memoryCached = this.memoryCache.get(cacheKey);
      if (memoryCached) {
        if (ignoreTTL || Date.now() - memoryCached.timestamp < this.config.cacheTTL) {
          return memoryCached.data;
        }
      }
    } catch (error) {
      console.warn('Tenlixor: Cache read error:', error);
    }

    return null;
  }

  /**
   * Save data to cache
   * @param languageCode - Language code
   * @param data - Data to cache
   */
  private saveToCache(languageCode: string, data: TenlixorResponseData): void {
    const cacheKey = this.getCacheKey(languageCode);
    const cacheData: TenlixorCacheEntry = {
      timestamp: Date.now(),
      data: data
    };

    try {
      // Try localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      }

      // Always save to in-memory cache as fallback
      this.memoryCache.set(cacheKey, cacheData);
    } catch (error) {
      console.warn('Tenlixor: Cache write error:', error);
    }
  }

  /**
   * Clear cache for a language
   * @param languageCode - Language code
   */
  private clearCache(languageCode: string): void {
    const cacheKey = this.getCacheKey(languageCode);

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(cacheKey);
      }

      this.memoryCache.delete(cacheKey);
    } catch (error) {
      console.warn('Tenlixor: Cache clear error:', error);
    }
  }

  /**
   * Generate cache key
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
