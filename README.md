# Tenlixor SDK

Official SDKs for [Tenlixor](https://tenlixor.verbytes.com) localization platform - Multilingual support for web and mobile applications.

[![npm version](https://img.shields.io/npm/v/@verbytes-tenlixor/sdk.svg)](https://www.npmjs.com/package/@verbytes-tenlixor/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📦 Available SDKs

### Web SDKs

#### [TypeScript/JavaScript SDK](./sdk/typescript)
Full-featured SDK with framework adapters for Angular, Vue, and React.

```bash
npm install @verbytes-tenlixor/sdk
```

**Features:**
- ✅ Full TypeScript support with strict typing
- ✅ Framework adapters: Angular Pipe, Vue Plugin, React Hooks
- ✅ Auto DOM scanning for automatic translations
- ✅ Smart caching with localStorage
- ✅ Zero runtime dependencies

**Supported Frameworks:**
- 🅰️ Angular 12+
- ⚛️ React 16.8+
- 🟢 Vue 3+
- 📜 Vanilla JavaScript/TypeScript

[📖 Documentation](./sdk/typescript/README.md) | [📦 npm](https://www.npmjs.com/package/@verbytes-tenlixor/sdk)

---

### Mobile SDKs

#### [React Native SDK](./sdk/react-native)
React Native SDK with AsyncStorage support for offline translations.

```bash
npm install @verbytes-tenlixor/react-native @react-native-async-storage/async-storage
```

**Features:**
- 📱 iOS & Android support
- 💾 Persistent storage with AsyncStorage
- 🔄 Automatic sync from API
- ⚡ Fast & lightweight
- 🎯 Full TypeScript support
- 🪝 React hooks integration

[📖 Documentation](./sdk/react-native/README.md) | [📦 npm](https://www.npmjs.com/package/@verbytes-tenlixor/react-native)

---

#### [Flutter SDK](./sdk/flutter)
Dart SDK for Flutter applications with SharedPreferences support.

```bash
flutter pub add tenlixor
```

**Features:**
- 📱 iOS & Android support
- 💾 Persistent storage with SharedPreferences
- 🔔 Event streams (loaded, languageChanged, error)
- 🎨 ChangeNotifier integration
- 🎯 Full Dart type safety
- ⚡ Fast & lightweight

[📖 Documentation](./sdk/flutter/README.md) | [📦 pub.dev](https://pub.dev/packages/tenlixor) (Coming Soon)

## 🚀 Quick Start

### Web (TypeScript/JavaScript)

```typescript
import { Tenlixor } from '@verbytes-tenlixor/sdk';

const txr = new Tenlixor({
  token: 'YOUR_API_TOKEN',
  tenantSlug: 'your-tenant-slug',
  language: 'en'
});

await txr.init();
console.log(txr.t('app.welcome')); // "Welcome to Tenlixor!"
```

### React Native

```tsx
import { Tenlixor, useTenlixor } from '@verbytes-tenlixor/react-native';

const txr = new Tenlixor({
  token: 'YOUR_API_TOKEN',
  tenantSlug: 'your-tenant-slug',
  language: 'en',
  persistentStorage: true
});

function App() {
  const { t, language, setLanguage, isReady } = useTenlixor(txr);
  
  if (!isReady) return <ActivityIndicator />;
  
  return (
    <View>
      <Text>{t('app.welcome')}</Text>
      <Button title="Switch to TR" onPress={() => setLanguage('tr')} />
    </View>
  );
}
```

## 📚 Documentation

- [TypeScript/JavaScript SDK Documentation](./sdk/typescript/README.md)
- [React Native SDK Documentation](./sdk/react-native/README.md)
- [Tenlixor Platform Documentation](https://tenlixor.verbytes.com/docs)

## 🧪 Test Applications

Test applications are available in the [test](./test) directory:

- [React Test App](./test/react-test) - Vite + React example
- [Vue Test App](./test/vue-test) - Vite + Vue example
- [Angular Test App](./test/angular-test) - Angular CLI example
- [JavaScript Test App](./test/javascript-test) - Vanilla JS example

## 🛠️ Development

### Structure

```
Tenlixor-SDK/
├── sdk/
│   ├── typescript/      # Web SDK (TS/JS)
│   ├── react-native/    # React Native SDK
│   └── javascript/      # Legacy JS build
├── test/
│   ├── react-test/
│   ├── vue-test/
│   ├── angular-test/
│   └── javascript-test/
└── README.md
```

### Building SDKs

```bash
# TypeScript SDK
cd sdk/typescript
npm install
npm run build

# React Native SDK
cd sdk/react-native
npm install
npm run build
```

## 📝 License

MIT © [Verbytes](https://verbytes.com)

## 🤝 Support

- 📧 Email: support@verbytes.com
- 🐛 Issues: [GitHub Issues](https://github.com/bbesli/Tenlixor-SDK/issues)
- 🌐 Website: [tenlixor.verbytes.com](https://tenlixor.verbytes.com)

## 🔗 Links

- [Tenlixor Platform](https://tenlixor.verbytes.com)
- [Verbytes](https://verbytes.com)
- [GitHub Repository](https://github.com/bbesli/Tenlixor-SDK)
