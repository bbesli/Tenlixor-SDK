/**
 * Tenlixor Angular Pipe
 * @module @verbytes-tenlixor/sdk/angular
 *
 * Usage:
 * 1. Import TenlixorModule in your app.module.ts
 * 2. Initialize Tenlixor instance in your app.component.ts
 * 3. Use the pipe in templates: {{ 'app.welcome' | txrTranslate }}
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Pipe, ChangeDetectorRef } from '@angular/core';
/**
 * Global Tenlixor instance holder
 */
let globalTenlixorInstance = null;
/**
 * Set the global Tenlixor instance
 * @param instance - Tenlixor instance
 */
export function setTenlixorInstance(instance) {
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
let TxrTranslatePipe = class TxrTranslatePipe {
    constructor(cdr) {
        this.cdr = cdr;
        this.lastValue = '';
        this.lastKey = '';
        this.lastLanguage = '';
        this.onLanguageChange = null;
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
    transform(key, languageCode) {
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
    ngOnDestroy() {
        // Clean up event listener
        if (globalTenlixorInstance && this.onLanguageChange) {
            globalTenlixorInstance.off('language-changed', this.onLanguageChange);
        }
    }
};
TxrTranslatePipe = __decorate([
    Pipe({
        name: 'txrTranslate',
        pure: false // Required for language switching to update UI
    }),
    __metadata("design:paramtypes", [ChangeDetectorRef])
], TxrTranslatePipe);
export { TxrTranslatePipe };
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
let TenlixorModule = class TenlixorModule {
};
TenlixorModule = __decorate([
    NgModule({
        declarations: [TxrTranslatePipe],
        imports: [CommonModule],
        exports: [TxrTranslatePipe]
    })
], TenlixorModule);
export { TenlixorModule };
//# sourceMappingURL=angular.pipe.js.map