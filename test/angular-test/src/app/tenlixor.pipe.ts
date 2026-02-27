import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Tenlixor } from '@verbytes-tenlixor/sdk';

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
 */
@Pipe({
  name: 'txrTranslate',
  pure: false
})
export class TxrTranslatePipe implements PipeTransform, OnDestroy {
  private lastValue: string = '';
  private lastKey: string = '';
  private lastLanguage: string = '';
  private onLanguageChange: ((data: any) => void) | null = null;

  constructor(private cdr: ChangeDetectorRef) {
    if (globalTenlixorInstance) {
      this.onLanguageChange = () => {
        this.cdr.markForCheck();
      };
      globalTenlixorInstance.on('language-changed', this.onLanguageChange);
    }
  }

  transform(key: string, languageCode?: string): string {
    if (!globalTenlixorInstance) {
      console.warn('TxrTranslatePipe: Tenlixor instance not initialized. Call setTenlixorInstance() first.');
      return key;
    }

    const currentLanguage = languageCode || globalTenlixorInstance.getLanguage();

    if (key === this.lastKey && currentLanguage === this.lastLanguage) {
      return this.lastValue;
    }

    this.lastKey = key;
    this.lastLanguage = currentLanguage;
    this.lastValue = globalTenlixorInstance.t(key, languageCode);

    return this.lastValue;
  }

  ngOnDestroy(): void {
    if (globalTenlixorInstance && this.onLanguageChange) {
      globalTenlixorInstance.off('language-changed', this.onLanguageChange);
    }
  }
}
