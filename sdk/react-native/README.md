# Tenlixor React Native SDK

Official React Native SDK for [Tenlixor](https://tenlixor.verbytes.com) localization platform with AsyncStorage support for offline translations.

[![npm version](https://img.shields.io/npm/v/@verbytes-tenlixor/react-native.svg)](https://www.npmjs.com/package/@verbytes-tenlixor/react-native)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Easy Integration** - Simple setup with React hooks
- 💾 **Persistent Storage** - Offline support with AsyncStorage
- 🔄 **Auto-Sync** - Automatic translation updates from API
- 🌍 **Multi-Language** - Switch languages dynamically
- ⚡ **Fast & Lightweight** - Minimal dependency footprint
- 📱 **iOS & Android** - Full cross-platform support
- 🎯 **TypeScript** - Full type safety included

## Installation

```bash
npm install @verbytes-tenlixor/react-native @react-native-async-storage/async-storage
```

or with yarn:

```bash
yarn add @verbytes-tenlixor/react-native @react-native-async-storage/async-storage
```

### Additional Setup

For iOS, install pods:

```bash
cd ios && pod install
```

## Quick Start

### 1. Create Tenlixor Instance

```tsx
import { Tenlixor } from '@verbytes-tenlixor/react-native';

const txr = new Tenlixor({
  token: 'your-api-token',
  tenantSlug: 'your-tenant-slug',
  language: 'en',
  persistentStorage: true, // Enable offline support
  fallbackLanguage: 'en'
});
```

### 2. Use in Your Components

```tsx
import React from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import { useTenlixor } from '@verbytes-tenlixor/react-native';

function App() {
  const { t, language, setLanguage, isReady, isLoading } = useTenlixor(txr);

  if (!isReady) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24 }}>{t('app.welcome')}</Text>
      <Text>{t('app.description')}</Text>
      
      <View style={{ marginTop: 20 }}>
        <Text>Current Language: {language}</Text>
        <Button 
          title="Switch to Turkish"
          onPress={() => setLanguage('tr')}
          disabled={isLoading}
        />
        <Button 
          title="Switch to English"
          onPress={() => setLanguage('en')}
          disabled={isLoading}
        />
      </View>
    </View>
  );
}

export default App;
```

## Configuration Options

### TenlixorConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `token` | `string` | **required** | Your Tenlixor API token |
| `tenantSlug` | `string` | **required** | Your tenant identifier |
| `language` | `string` | `'en'` | Default language code |
| `apiUrl` | `string` | Tenlixor API | Custom API endpoint |
| `persistentStorage` | `boolean` | `true` | Enable AsyncStorage caching |
| `storageKey` | `string` | `'@tenlixor'` | AsyncStorage key prefix |
| `cacheTTL` | `number` | `300000` | Cache duration (5 min) |
| `fallbackLanguage` | `string` | `'en'` | Fallback language |

## API Reference

### `useTenlixor(txr: Tenlixor)`

React hook for using Tenlixor in components.

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `t` | `(key: string, lang?: string) => string` | Translation function |
| `language` | `string` | Current language code |
| `availableLanguages` | `string[]` | Available languages |
| `isReady` | `boolean` | SDK initialization status |
| `isLoading` | `boolean` | Loading state |
| `setLanguage` | `(lang: string) => Promise<void>` | Change language |
| `reload` | `() => Promise<void>` | Reload translations |

### Core Methods

#### `txr.init()`

Initialize the SDK and load translations.

```tsx
await txr.init();
```

#### `txr.t(key, languageCode?)`

Translate a key to its value.

```tsx
const welcome = txr.t('app.welcome');
const welcomeTR = txr.t('app.welcome', 'tr');
```

#### `txr.setLanguage(languageCode)`

Change the active language.

```tsx
await txr.setLanguage('tr');
```

#### `txr.clearStorage()`

Clear all persisted translations from AsyncStorage.

```tsx
await txr.clearStorage();
```

## Advanced Usage

### Global Instance with createTenlixorHook

Create a global hook to use the same instance across your app:

```tsx
// src/i18n.ts
import { Tenlixor, createTenlixorHook } from '@verbytes-tenlixor/react-native';

const txr = new Tenlixor({
  token: 'your-token',
  tenantSlug: 'your-tenant',
  language: 'en'
});

export const useTenlixorGlobal = createTenlixorHook(txr);

// src/components/MyComponent.tsx
import { useTenlixorGlobal } from '../i18n';

function MyComponent() {
  const { t } = useTenlixorGlobal();
  return <Text>{t('hello')}</Text>;
}
```

### Event Listeners

Listen to SDK events:

```tsx
txr.on('loaded', (data) => {
  console.log(`Translations loaded for ${data.language}`);
});

txr.on('language-changed', (data) => {
  console.log(`Language changed from ${data.from} to ${data.to}`);
});

txr.on('error', (error) => {
  console.error('Tenlixor error:', error);
});
```

### Custom Storage Adapter

Implement your own storage adapter:

```tsx
import { Tenlixor, IStorageAdapter } from '@verbytes-tenlixor/react-native';

class MyCustomStorage implements IStorageAdapter {
  async setItem(key: string, value: string): Promise<void> {
    // Your implementation
  }

  async getItem(key: string): Promise<string | null> {
    // Your implementation
  }

  async removeItem(key: string): Promise<void> {
    // Your implementation
  }

  async clear(): Promise<void> {
    // Your implementation
  }
}

const txr = new Tenlixor(config, new MyCustomStorage());
```

## Offline Support

The SDK automatically caches translations in AsyncStorage:

1. **First Load**: Fetches from API and caches locally
2. **Subsequent Loads**: Uses cached data, then updates from API in background
3. **Offline Mode**: Uses cached data when network is unavailable

```tsx
const txr = new Tenlixor({
  token: 'your-token',
  tenantSlug: 'your-tenant',
  persistentStorage: true, // Enable offline support
  cacheTTL: 3600000 // Cache for 1 hour
});
```

## Example App

Check out the [example app](../../test/react-native-test) for a complete implementation.

## Troubleshooting

### AsyncStorage Not Found

Make sure you have installed `@react-native-async-storage/async-storage`:

```bash
npm install @react-native-async-storage/async-storage
cd ios && pod install
```

### Translations Not Updating

Try clearing the cache:

```tsx
await txr.clearStorage();
await txr.reload();
```

### TypeScript Errors

Ensure you're using TypeScript 4.5+ and have `@types/react-native` installed.

## Support

- 📧 Email: support@verbytes.com
- 🐛 Issues: [GitHub Issues](https://github.com/bbesli/Tenlixor-SDK/issues)
- 📚 Docs: [tenlixor.verbytes.com](https://tenlixor.verbytes.com)

## Related SDKs

- 🌐 [TypeScript/JavaScript SDK](../typescript) - Web applications
- 🎯 [Flutter SDK](../flutter) - Flutter apps ([pub.dev](https://pub.dev/packages/tenlixor))

## License

MIT © [Verbytes](https://verbytes.com)
