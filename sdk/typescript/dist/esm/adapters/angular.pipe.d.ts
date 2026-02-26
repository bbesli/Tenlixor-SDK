/**
 * Tenlixor Angular Pipe
 * @module @verbytes-tenlixor/sdk/angular
 *
 * Usage:
 * 1. Import TenlixorModule in your app.module.ts
 * 2. Initialize Tenlixor instance in your app.component.ts
 * 3. Use the pipe in templates: {{ 'app.welcome' | txrTranslate }}
 */
import { PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Tenlixor } from '../tenlixor';
/**
 * Set the global Tenlixor instance
 * @param instance - Tenlixor instance
 */
export declare function setTenlixorInstance(instance: Tenlixor): void;
/**
 * Tenlixor Translation Pipe
 *
 * @example
 * ```html
 * <h1>{{ 'app.welcome' | txrTranslate }}</h1>
 * <p>{{ 'app.description' | txrTranslate:'tr' }}</p>
 * ```
 */
export declare class TxrTranslatePipe implements PipeTransform, OnDestroy {
    private cdr;
    private lastValue;
    private lastKey;
    private lastLanguage;
    private onLanguageChange;
    constructor(cdr: ChangeDetectorRef);
    /**
     * Transform a translation key to its value
     * @param key - Translation key
     * @param languageCode - Optional language code override
     * @returns Translated value
     */
    transform(key: string, languageCode?: string): string;
    ngOnDestroy(): void;
}
export declare class TenlixorModule {
}
//# sourceMappingURL=angular.pipe.d.ts.map