/**
 * Tenlixor Angular Pipe
 * @module @verbytes-tenlixor/sdk/angular
 * 
 * Usage:
 * 1. Import TenlixorModule in your app.module.ts
 * 2. Initialize Tenlixor instance in your app.component.ts
 * 3. Use the pipe in templates: {{ 'app.welcome' | txrTranslate }}
 */

import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Tenlixor } from '../tenlixor';

/**
 * Global Tenlixor instance holder
 */
let globalTenlixorInstance: Tenlixor | null = null;

/**
 * Set the global Tenlixor instance
 * @param instance - Tenlixor instance
 */
export function setTenlixorInstance(instance: Tenlixor): void {
  globalTenlixorInstance = instance;
}

/**
 * Tenlixor Translation Pipe
 * 
 * @example
 * ```html
 * <h1>{{ 'app.welcome' | txrTranslate }}</h1>
 * <p>{{ 'app.description' | txrTranslate:'tr' }}</p>
 * ```
 */
@Pipe({
  name: 'txrTranslate',
  pure: false // Required for language switching to update UI
})
export class TxrTranslatePipe implements PipeTransform, OnDestroy {
  private lastValue: string = '';
  private lastKey: string = '';
  private lastLanguage: string = '';
  private onLanguageChange: ((data: any) => void) | null = null;

  constructor(private cdr: ChangeDetectorRef) {
    // Listen for language changes to trigger re-rendering
    if (globalTenlixorInstance) {
      this.onLanguageChange = () => {
        this.cdr.markForCheck();
      };
      globalTenlixorInstance.on('language-changed', this.onLanguageChange);
    }
  }

  /**
   * Transform a translation key to its value
   * @param key - Translation key
   * @param languageCode - Optional language code override
   * @returns Translated value
   */
  transform(key: string, languageCode?: string): string {
    if (!globalTenlixorInstance) {
      console.warn('TxrTranslatePipe: Tenlixor instance not initialized. Call setTenlixorInstance() first.');
      return key;
    }

    const currentLanguage = languageCode || globalTenlixorInstance.getLanguage();

    // Return cached value if key and language haven't changed
    if (key === this.lastKey && currentLanguage === this.lastLanguage) {
      return this.lastValue;
    }

    // Get translation
    this.lastKey = key;
    this.lastLanguage = currentLanguage;
    this.lastValue = globalTenlixorInstance.t(key, languageCode);

    return this.lastValue;
  }

  ngOnDestroy(): void {
    // Clean up event listener
    if (globalTenlixorInstance && this.onLanguageChange) {
      globalTenlixorInstance.off('language-changed', this.onLanguageChange);
    }
  }
}

/**
 * Angular Module for Tenlixor
 * 
 * @example
 * ```typescript
 * import { NgModule } from '@angular/core';
 * import { TenlixorModule, setTenlixorInstance } from '@verbytes-tenlixor/sdk/angular';
 * import { Tenlixor } from '@verbytes-tenlixor/sdk';
 * 
 * const txr = new Tenlixor({ token: 'YOUR_TOKEN', language: 'en' });
 * txr.init();
 * setTenlixorInstance(txr);
 * 
 * @NgModule({
 *   imports: [TenlixorModule],
 *   // ...
 * })
 * export class AppModule { }
 * ```
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [TxrTranslatePipe],
  imports: [CommonModule],
  exports: [TxrTranslatePipe]
})
export class TenlixorModule { }
