/**
 * Tenlixor JavaScript SDK
 * A lightweight localization SDK for fetching and rendering translations from Tenlixor API
 * @version 1.0.0
 * @license MIT
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Tenlixor = factory());
})(this, (function () {
  'use strict';

  /**
   * Main Tenlixor SDK Class
   */
  class Tenlixor {
    /**
     * Initialize Tenlixor SDK
     * @param {Object} config - Configuration object
     * @param {string} config.token - API authentication token (required)
     * @param {string} config.tenantSlug - Tenant slug identifier (required)
     * @param {string} [config.language='en'] - Default language code
     * @param {string} [config.apiUrl='https://api-tenlixor.verbytes.com/api/v1/strings'] - API base URL
     * @param {boolean} [config.cache=true] - Enable caching
     * @param {number} [config.cacheTTL=300000] - Cache TTL in milliseconds (default: 5 minutes)
     * @param {string} [config.fallbackLanguage='en'] - Fallback language if translation not found
     * @param {boolean} [config.autoScan=true] - Automatically scan DOM on init
     */
    constructor(config = {}) {
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
    }

    /**
     * Initialize SDK: fetch strings and optionally scan DOM
     * @returns {Promise<void>}
     */
    async init() {
      if (this.isLoading) {
        return;
      }

      this.isLoading = true;

      try {
        await this.fetchStrings(this.currentLanguage);
        this.isInitialized = true;

        if (this.config.autoScan) {
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.scan());
          } else {
            this.scan();
          }
        }

        this.emit('loaded', { language: this.currentLanguage });
      } catch (error) {
        this.emit('error', { code: 'INIT_FAILED', message: error.message, error });
      } finally {
        this.isLoading = false;
      }
    }

    /**
     * Fetch strings from API for a specific language
     * @param {string} languageCode - Language code to fetch
     * @returns {Promise<Object>} Fetched data
     */
    async fetchStrings(languageCode) {
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

        const result = await response.json();

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
     * @param {Object} data - Data from API
     */
    mergeData(data) {
      if (data.languages && Array.isArray(data.languages)) {
        data.languages.forEach(lang => {
          const keyValueMap = {};
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
     * @param {string} key - Translation key (e.g., 'app.welcome')
     * @param {string} [languageCode] - Language code (optional, uses current language)
     * @returns {string} Translated value or key if not found
     */
    t(key, languageCode) {
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
     * @param {string} languageCode - New language code
     * @returns {Promise<void>}
     */
    async setLanguage(languageCode) {
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
          message: error.message, 
          error 
        });
        throw error;
      }
    }

    /**
     * Reload strings from API (bypass cache)
     * @returns {Promise<void>}
     */
    async reload() {
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
    scan() {
      if (!this.isInitialized) {
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
     * @param {Node} node - Root node to scan
     * @param {string} lang - Language code
     */
    scanTextNodes(node, lang) {
      if (!node) return;

      // Skip already processed elements
      if (node.nodeType === Node.ELEMENT_NODE && 
          node.hasAttribute('data-txr-resolved')) {
        return;
      }

      // Process text nodes
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.trim();
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
        const tagName = node.tagName.toLowerCase();
        if (tagName !== 'script' && tagName !== 'style' && tagName !== 'noscript') {
          node.childNodes.forEach(child => this.scanTextNodes(child, lang));
        }
      }
    }

    /**
     * Register event listener
     * @param {string} event - Event name: 'loaded', 'error', 'language-changed'
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
      if (this.listeners[event] && typeof callback === 'function') {
        this.listeners[event].push(callback);
      }
    }

    /**
     * Unregister event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function to remove
     */
    off(event, callback) {
      if (this.listeners[event]) {
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
      }
    }

    /**
     * Emit event to all registered listeners
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data) {
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
     * @param {string} languageCode - Language code
     * @param {boolean} [ignoreTTL=false] - Ignore TTL check
     * @returns {Object|null} Cached data or null
     */
    getFromCache(languageCode, ignoreTTL = false) {
      const cacheKey = this.getCacheKey(languageCode);

      try {
        // Try localStorage first
        if (typeof localStorage !== 'undefined') {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (ignoreTTL || Date.now() - parsed.timestamp < this.config.cacheTTL) {
              return parsed.data;
            }
          }
        }

        // Fallback to in-memory cache
        if (this._memoryCache && this._memoryCache[cacheKey]) {
          const cached = this._memoryCache[cacheKey];
          if (ignoreTTL || Date.now() - cached.timestamp < this.config.cacheTTL) {
            return cached.data;
          }
        }
      } catch (error) {
        console.warn('Tenlixor: Cache read error:', error);
      }

      return null;
    }

    /**
     * Save data to cache
     * @param {string} languageCode - Language code
     * @param {Object} data - Data to cache
     */
    saveToCache(languageCode, data) {
      const cacheKey = this.getCacheKey(languageCode);
      const cacheData = {
        timestamp: Date.now(),
        data: data
      };

      try {
        // Try localStorage
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        }

        // Always save to in-memory cache as fallback
        if (!this._memoryCache) {
          this._memoryCache = {};
        }
        this._memoryCache[cacheKey] = cacheData;
      } catch (error) {
        console.warn('Tenlixor: Cache write error:', error);
      }
    }

    /**
     * Clear cache for a language
     * @param {string} languageCode - Language code
     */
    clearCache(languageCode) {
      const cacheKey = this.getCacheKey(languageCode);

      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(cacheKey);
        }

        if (this._memoryCache && this._memoryCache[cacheKey]) {
          delete this._memoryCache[cacheKey];
        }
      } catch (error) {
        console.warn('Tenlixor: Cache clear error:', error);
      }
    }

    /**
     * Generate cache key
     * @param {string} languageCode - Language code
     * @returns {string} Cache key
     */
    getCacheKey(languageCode) {
      const tenantId = this.data.tenant_id || 'default';
      return `txr_${tenantId}_${languageCode}`;
    }

    /**
     * Get current language
     * @returns {string} Current language code
     */
    getLanguage() {
      return this.currentLanguage;
    }

    /**
     * Get all available languages
     * @returns {string[]} Array of language codes
     */
    getAvailableLanguages() {
      return Object.keys(this.data.languages);
    }

    /**
     * Check if SDK is initialized
     * @returns {boolean} Initialization status
     */
    isReady() {
      return this.isInitialized;
    }
  }

  return Tenlixor;
}));
