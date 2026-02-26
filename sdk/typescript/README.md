# Tenlixor TypeScript SDK

A fully-typed TypeScript SDK for Tenlixor localization platform with built-in support for Angular, Vue, and React.

## Features

- ✅ **Full TypeScript Support** - Strict typing with comprehensive interfaces
- ✅ **Framework Adapters** - Angular Pipe, Vue Plugin, React Hooks
- ✅ **Auto DOM Scanning** - Automatic translation of page content
- ✅ **Smart Caching** - localStorage with in-memory fallback
- ✅ **Event System** - Hook into load, error, and language-change events
- ✅ **Tree-shakeable** - Import only what you need
- ✅ **Zero Runtime Dependencies** - Lightweight and fast

## Installation

```bash
# NPM
npm install @verbytes-tenlixor/sdk

# Yarn
yarn add @verbytes-tenlixor/sdk

# PNPM
pnpm add @verbytes-tenlixor/sdk
```

## Quick Start

### Vanilla TypeScript

```typescript
import { Tenlixor } from '@verbytes-tenlixor/sdk';

const txr = new Tenlixor({
  token: 'YOUR_API_TOKEN',
  language: 'en'
});

await txr.init();

// Translate
const greeting = txr.t('app.welcome');
console.log(greeting); // "Welcome to Tenlixor!"

// Change language
await txr.setLanguage('tr');
```

### Angular

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import { TenlixorModule, setTenlixorInstance } from '@verbytes-tenlixor/sdk/angular';
import { Tenlixor } from '@verbytes-tenlixor/sdk';

const txr = new Tenlixor({ token: 'YOUR_TOKEN', language: 'en' });
txr.init();
setTenlixorInstance(txr);

@NgModule({
  imports: [TenlixorModule],
  // ...
})
export class AppModule { }
```

```html
<!-- component.html -->
<h1>{{ 'app.welcome' | txrTranslate }}</h1>
<p>{{ 'app.description' | txrTranslate:'tr' }}</p>
```

### Vue 3

```typescript
// main.ts
import { createApp } from 'vue';
import { createTenlixorPlugin } from '@verbytes-tenlixor/sdk/vue';
import App from './App.vue';

const app = createApp(App);

app.use(createTenlixorPlugin({
  token: 'YOUR_TOKEN',
  language: 'en'
}));

app.mount('#app');
```

```vue
<!-- Component.vue -->
<script setup lang="ts">
import { useTenlixorTranslate } from '@verbytes-tenlixor/sdk/vue';

const { t, currentLanguage, setLanguage } = useTenlixorTranslate();
</script>

<template>
  <div>
    <h1>{{ t('app.welcome') }}</h1>
    <p>Current language: {{ currentLanguage }}</p>
    <button @click="setLanguage('tr')">Switch to Turkish</button>
  </div>
</template>
```

### React

```tsx
// App.tsx
import { TenlixorProvider } from '@verbytes-tenlixor/sdk/react';

function App() {
  return (
    <TenlixorProvider config={{ token: 'YOUR_TOKEN', language: 'en' }}>
      <YourApp />
    </TenlixorProvider>
  );
}
```

```tsx
// Component.tsx
import { useTenlixor } from '@verbytes-tenlixor/sdk/react';

function MyComponent() {
  const { t, currentLanguage, setLanguage, isReady } = useTenlixor();

  if (!isReady) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{t('app.welcome')}</h1>
      <p>Language: {currentLanguage}</p>
      <button onClick={() => setLanguage('tr')}>Switch to Turkish</button>
    </div>
  );
}
```

## Configuration

```typescript
interface TenlixorConfig {
  token: string;                    // Required: API token
  language?: string;                // Default: 'en'
  apiUrl?: string;                  // Default: API base URL
  cache?: boolean;                  // Default: true
  cacheTTL?: number;               // Default: 300000 (5 min)
  fallbackLanguage?: string;        // Default: 'en'
  autoScan?: boolean;              // Default: true
}
```

## API Reference

### Core Methods

#### `init(): Promise<void>`
Initialize the SDK and fetch translations.

#### `t(key: string, languageCode?: string): string`
Translate a key to its value.

#### `setLanguage(languageCode: string): Promise<void>`
Change the active language.

#### `reload(): Promise<void>`
Force reload translations from API.

#### `scan(): void`
Manually scan and translate DOM elements.

#### `on(event: TenlixorEventType, callback: Function): void`
Register event listener.

Events: `'loaded'`, `'error'`, `'language-changed'`

#### `off(event: TenlixorEventType, callback: Function): void`
Unregister event listener.

#### `getLanguage(): string`
Get current language code.

#### `getAvailableLanguages(): string[]`
Get all loaded language codes.

#### `isReady(): boolean`
Check if SDK is initialized.

---

## Framework APIs

### Angular

**Module:** `TenlixorModule`  
**Pipe:** `txrTranslate`  
**Setup Function:** `setTenlixorInstance(instance: Tenlixor)`

```html
<h1>{{ 'app.welcome' | txrTranslate }}</h1>
<p>{{ 'app.description' | txrTranslate:'tr' }}</p>
```

---

### Vue

**Plugin:** `createTenlixorPlugin(options: TenlixorPluginOptions)`  
**Composables:**
- `useTenlixor(): Tenlixor`
- `useTenlixorTranslate(): TenlixorTranslateComposable`

**Options API:**
```javascript
this.$txr.t('app.welcome')
this.$t('app.welcome')
```

**Composition API:**
```typescript
const { t, currentLanguage, setLanguage, availableLanguages, isReady } = useTenlixorTranslate();
```

---

### React

**Provider:** `<TenlixorProvider config={...}>`  
**Hooks:**
- `useTenlixor(): TenlixorContextValue`
- `useTranslate(): TranslateFunction`
- `useLanguage(): [string, SetLanguageFunction, string[]]`

**HOC:** `withTenlixor<P>(Component): React.FC<P>`

```tsx
const { t, currentLanguage, setLanguage, availableLanguages, isReady, isLoading, error } = useTenlixor();
```

---

## Type Definitions

All types are exported and available for import:

```typescript
import type {
  TenlixorConfig,
  TenlixorResource,
  TenlixorLanguage,
  TenlixorResponse,
  TenlixorEventType,
  TranslateFunction,
  // ... and more
} from '@verbytes-tenlixor/sdk';
```

## DOM Auto-Scan

The SDK automatically scans the DOM for translation keys:

**Method 1: Text Content**
```html
<h1>app.welcome</h1>
<!-- Becomes -->
<h1 data-txr-resolved="true" data-txr-key="app.welcome">Welcome to Tenlixor!</h1>
```

**Method 2: Data Attribute**
```html
<p data-txr-key="app.description"></p>
<!-- Becomes -->
<p data-txr-key="app.description" data-txr-resolved="true">Your platform description</p>
```

## Caching

- **Storage:** localStorage (primary), in-memory (fallback)
- **TTL:** 5 minutes (configurable)
- **Cache Key:** `txr_{tenant_id}_{language_code}`
- **Invalidation:** Automatic on expiry or manual with `reload()`

## Error Handling

The SDK never throws errors that break your page:
- Network errors emit `'error'` event
- Missing keys return the key itself as fallback
- Stale cache is used if API is unavailable

```typescript
txr.on('error', (error) => {
  console.error('Tenlixor error:', error.code, error.message);
});
```

## Build

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run build:watch

# Lint
npm run lint

# Format
npm run format
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required:** ES2020 support, `fetch`, `Promise`, `Map`

## TypeScript Version

Requires TypeScript 5.0+

## License

MIT

## Support

- 📧 Email: support@tenlixor.com
- 📖 Docs: https://docs.tenlixor.com
- 🐛 Issues: https://github.com/tenlixor/sdk/issues

---

**Made with ❤️ by the Tenlixor Team**
