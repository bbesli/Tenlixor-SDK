/**
 * Tenlixor TypeScript SDK - Core Class
 * @module @verbytes-tenlixor/sdk
 */
import type { TenlixorConfig, TenlixorEventType, TenlixorEventHandler, ITenlixor } from './types';
/**
 * Main Tenlixor SDK Class
 */
export declare class Tenlixor implements ITenlixor {
    private config;
    private data;
    private listeners;
    private isInitialized;
    private currentLanguage;
    private isLoading;
    private memoryCache;
    /**
     * Create a new Tenlixor instance
     * @param config - Configuration object
     * @throws {Error} If API token is not provided
     */
    constructor(config: TenlixorConfig);
    /**
     * Initialize SDK: fetch strings and optionally scan DOM
     */
    init(): Promise<void>;
    /**
     * Fetch strings from API for a specific language
     * @param languageCode - Language code to fetch
     * @returns Fetched data
     */
    private fetchStrings;
    /**
     * Merge fetched data into internal storage
     * @param data - Data from API
     */
    private mergeData;
    /**
     * Translate a key to its value
     * @param key - Translation key (e.g., 'app.welcome')
     * @param languageCode - Language code (optional, uses current language)
     * @returns Translated value or key if not found
     */
    t(key: string, languageCode?: string): string;
    /**
     * Change active language and re-scan DOM
     * @param languageCode - New language code
     */
    setLanguage(languageCode: string): Promise<void>;
    /**
     * Reload strings from API (bypass cache)
     */
    reload(): Promise<void>;
    /**
     * Manually scan and translate DOM elements
     */
    scan(): void;
    /**
     * Recursively scan text nodes for translation keys
     * @param node - Root node to scan
     * @param lang - Language code
     */
    private scanTextNodes;
    /**
     * Register event listener
     * @param event - Event name
     * @param callback - Callback function
     */
    on(event: TenlixorEventType, callback: TenlixorEventHandler): void;
    /**
     * Unregister event listener
     * @param event - Event name
     * @param callback - Callback function to remove
     */
    off(event: TenlixorEventType, callback: TenlixorEventHandler): void;
    /**
     * Emit event to all registered listeners
     * @param event - Event name
     * @param data - Event data
     */
    private emit;
    /**
     * Get data from cache
     * @param languageCode - Language code
     * @param ignoreTTL - Ignore TTL check
     * @returns Cached data or null
     */
    private getFromCache;
    /**
     * Save data to cache
     * @param languageCode - Language code
     * @param data - Data to cache
     */
    private saveToCache;
    /**
     * Clear cache for a language
     * @param languageCode - Language code
     */
    private clearCache;
    /**
     * Generate cache key
     * @param languageCode - Language code
     * @returns Cache key
     */
    private getCacheKey;
    /**
     * Get current language
     * @returns Current language code
     */
    getLanguage(): string;
    /**
     * Get all available languages
     * @returns Array of language codes
     */
    getAvailableLanguages(): string[];
    /**
     * Check if SDK is initialized
     * @returns Initialization status
     */
    isReady(): boolean;
}
//# sourceMappingURL=tenlixor.d.ts.map