/**
 * AsyncStorage Adapter for Tenlixor React Native SDK
 * @module @verbytes-tenlixor/react-native/storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { IStorageAdapter } from '../types';

/**
 * AsyncStorage implementation of IStorageAdapter
 */
export class AsyncStorageAdapter implements IStorageAdapter {
  /**
   * Save data to AsyncStorage
   * @param key - Storage key
   * @param value - Value to store (will be stringified if object)
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`[Tenlixor] Failed to save to AsyncStorage: ${key}`, error);
      throw error;
    }
  }

  /**
   * Retrieve data from AsyncStorage
   * @param key - Storage key
   * @returns Stored value or null if not found
   */
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`[Tenlixor] Failed to read from AsyncStorage: ${key}`, error);
      return null;
    }
  }

  /**
   * Remove data from AsyncStorage
   * @param key - Storage key
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {	
      console.error(`[Tenlixor] Failed to remove from AsyncStorage: ${key}`, error);
      throw error;
    }
  }

  /**
   * Clear all AsyncStorage data (use with caution!)
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('[Tenlixor] Failed to clear AsyncStorage', error);
      throw error;
    }
  }

  /**
   * Get all keys matching a specific prefix
   * @param prefix - Key prefix to match
   * @returns Array of matching keys
   */
  async getKeysWithPrefix(prefix: string): Promise<string[]> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      return allKeys.filter(key => key.startsWith(prefix));
    } catch (error) {
      console.error('[Tenlixor] Failed to get keys from AsyncStorage', error);
      return [];
    }
  }

  /**
   * Remove all keys matching a specific prefix
   * @param prefix - Key prefix to match
   */
  async removeKeysWithPrefix(prefix: string): Promise<void> {
    try {
      const keys = await this.getKeysWithPrefix(prefix);
      if (keys.length > 0) {
        await AsyncStorage.multiRemove(keys);
      }
    } catch (error) {
      console.error('[Tenlixor] Failed to remove keys from AsyncStorage', error);
      throw error;
    }
  }
}

/**
 * Default storage adapter instance
 */
export const defaultStorageAdapter = new AsyncStorageAdapter();
