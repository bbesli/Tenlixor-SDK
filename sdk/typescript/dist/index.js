"use strict";
/**
 * Tenlixor TypeScript SDK
 * Main entry point
 * @module @verbytes-tenlixor/sdk
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.Tenlixor = void 0;
// Core exports
var tenlixor_1 = require("./tenlixor");
Object.defineProperty(exports, "Tenlixor", { enumerable: true, get: function () { return tenlixor_1.Tenlixor; } });
__exportStar(require("./types"), exports);
// Framework adapters (individual imports)
// import { TxrTranslatePipe, TenlixorModule, setTenlixorInstance } from '@verbytes-tenlixor/sdk/angular';
// import { createTenlixorPlugin, useTenlixor, useTenlixorTranslate } from '@verbytes-tenlixor/sdk/vue';
// import { TenlixorProvider, useTenlixor, useTranslate, useLanguage } from '@verbytes-tenlixor/sdk/react';
/**
 * Default export
 */
var tenlixor_2 = require("./tenlixor");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return tenlixor_2.Tenlixor; } });
//# sourceMappingURL=index.js.map