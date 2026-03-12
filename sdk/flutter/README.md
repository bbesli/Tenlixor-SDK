# Tenlixor Flutter SDK

Official Flutter SDK for [Tenlixor](https://tenlixor.verbytes.com) localization platform with SharedPreferences support for offline translations.

[![pub package](https://img.shields.io/pub/v/tenlixor.svg)](https://pub.dev/packages/tenlixor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 📱 **iOS & Android Support** - Works seamlessly on both platforms
- 💾 **Persistent Storage** - Offline support with SharedPreferences
- 🔄 **Auto-Sync** - Automatic translation updates from API
- 🌍 **Multi-Language** - Switch languages dynamically
- ⚡ **Fast & Lightweight** - Minimal dependency footprint
- 🎯 **Type Safe** - Full Dart type safety
- 🔔 **Event Streams** - Listen to SDK events (loaded, languageChanged, error)
- 🎨 **ChangeNotifier** - Built-in state management integration

## Installation

Add this to your package's `pubspec.yaml` file:

```yaml
dependencies:
  tenlixor: ^1.0.0
```

Then run:

```bash
flutter pub get
```

## Quick Start

### 1. Import the Package

```dart
import 'package:tenlixor/tenlixor.dart';
```

### 2. Create Tenlixor Instance

```dart
final txr = Tenlixor(
  config: TenlixorConfig(
    token: 'YOUR_API_TOKEN',
    tenantSlug: 'your-tenant-slug',
    language: 'en',
    persistentStorage: true,
    fallbackLanguage: 'en',
  ),
);

await txr.init();
```

### 3. Use in Your Widgets

```dart
class MyApp extends StatefulWidget {
  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  late final Tenlixor txr;

  @override
  void initState() {
    super.initState();
    txr = Tenlixor(
      config: TenlixorConfig(
        token: 'YOUR_API_TOKEN',
        tenantSlug: 'your-tenant-slug',
        language: 'en',
      ),
    );
    txr.addListener(() => setState(() {}));
    txr.init();
  }

  @override
  void dispose() {
    txr.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!txr.isReady) {
      return CircularProgressIndicator();
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(txr.t('app.title')),
      ),
      body: Column(
        children: [
          Text(txr.t('app.welcome')),
          ElevatedButton(
            onPressed: () => txr.setLanguage('tr'),
            child: Text('Switch to Turkish'),
          ),
        ],
      ),
    );
  }
}
```

## Configuration Options

### TenlixorConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `token` | `String` | **required** | Your Tenlixor API token |
| `tenantSlug` | `String` | **required** | Your tenant identifier |
| `language` | `String` | `'en'` | Default language code |
| `apiUrl` | `String?` | `null` | Custom API endpoint |
| `persistentStorage` | `bool` | `true` | Enable SharedPreferences caching |
| `storageKey` | `String` | `'tenlixor'` | SharedPreferences key prefix |
| `cacheTTL` | `int` | `300000` | Cache duration (5 min) |
| `fallbackLanguage` | `String?` | `null` | Fallback language |

## API Reference

### Tenlixor Class

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `isReady` | `bool` | SDK initialization status |
| `isLoading` | `bool` | Loading state |
| `language` | `String` | Current language code |
| `availableLanguages` | `List<String>` | Available languages |
| `events` | `Stream<TenlixorEvent>` | Event stream |

#### Methods

##### `init()`

Initialize the SDK and load translations.

```dart
await txr.init();
```

##### `t(String key, [String? languageCode])`

Translate a key to its value.

```dart
final welcome = txr.t('app.welcome');
final welcomeTR = txr.t('app.welcome', 'tr');
```

##### `setLanguage(String languageCode)`

Change the active language.

```dart
await txr.setLanguage('tr');
```

##### `reload()`

Reload current language translations.

```dart
await txr.reload();
```

##### `clearStorage()`

Clear all cached translations from SharedPreferences.

```dart
await txr.clearStorage();
```

## Advanced Usage

### Listening to Events

```dart
txr.events.listen((event) {
  switch (event.type) {
    case TenlixorEventType.loaded:
      print('Translations loaded: ${event.data}');
      break;
    case TenlixorEventType.languageChanged:
      print('Language changed: ${event.data}');
      break;
    case TenlixorEventType.error:
      print('Error: ${event.data}');
      break;
  }
});
```

### Using with Provider

```dart
import 'package:provider/provider.dart';

void main() {
  final txr = Tenlixor(
    config: TenlixorConfig(
      token: 'YOUR_TOKEN',
      tenantSlug: 'your-tenant',
    ),
  );

  runApp(
    ChangeNotifierProvider.value(
      value: txr,
      child: MyApp(),
    ),
  );
}

class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final txr = context.watch<Tenlixor>();
    
    return Text(txr.t('app.welcome'));
  }
}
```

### Custom Storage Adapter

Implement your own storage adapter:

```dart
class CustomStorageAdapter implements IStorageAdapter {
  @override
  Future<void> setItem(String key, String value) async {
    // Your implementation
  }

  @override
  Future<String?> getItem(String key) async {
    // Your implementation
  }

  @override
  Future<void> removeItem(String key) async {
    // Your implementation
  }

  @override
  Future<void> clear() async {
    // Your implementation
  }

  @override
  Future<List<String>> getKeys(String prefix) async {
    // Your implementation
  }

  @override
  Future<void> removeKeys(String prefix) async {
    // Your implementation
  }
}

final txr = Tenlixor(
  config: config,
  storage: CustomStorageAdapter(),
);
```

## Offline Support

The SDK automatically caches translations in SharedPreferences:

1. **First Load**: Fetches from API and caches locally
2. **Subsequent Loads**: Uses cached data, then updates from API in background
3. **Offline Mode**: Uses cached data when network is unavailable

```dart
final txr = Tenlixor(
  config: TenlixorConfig(
    token: 'your-token',
    tenantSlug: 'your-tenant',
    persistentStorage: true, // Enable offline support
    cacheTTL: 3600000, // Cache for 1 hour
  ),
);
```

## Example App

Check out the [example app](./example) for a complete implementation.

To run the example:

```bash
cd example
flutter pub get
flutter run
```

## Platform Support

| Platform | Support |
|----------|---------|
| Android  | ✅ Yes  |
| iOS      | ✅ Yes  |
| Web      | ✅ Yes  |
| Windows  | ✅ Yes  |
| macOS    | ✅ Yes  |
| Linux    | ✅ Yes  |

## Troubleshooting

### SharedPreferences Not Working

Make sure you have added the required permissions:

**Android** (`android/app/src/main/AndroidManifest.xml`):
```xml
<!-- No special permissions needed for SharedPreferences -->
```

**iOS** (`ios/Runner/Info.plist`):
```xml
<!-- No special permissions needed for SharedPreferences -->
```

### Translations Not Updating

Try clearing the cache:

```dart
await txr.clearStorage();
await txr.reload();
```

### API Errors

Make sure your token and tenant slug are correct:

```dart
txr.events.listen((event) {
  if (event.type == TenlixorEventType.error) {
    print('Error: ${event.data}');
  }
});
```

## Migration from Web SDK

If you're migrating from the TypeScript/JavaScript SDK:

| Web SDK | Flutter SDK | Notes |
|---------|-------------|-------|
| `new Tenlixor(config)` | `Tenlixor(config: TenlixorConfig(...))` | Named parameters |
| `txr.on('loaded')` | `txr.events.listen()` | Stream-based events |
| `localStorage` | `SharedPreferences` | Different storage mechanism |
| `txr.scan()` | N/A | Not applicable in Flutter |

## Support

- 📧 Email: support@verbytes.com
- 🐛 Issues: [GitHub Issues](https://github.com/bbesli/Tenlixor-SDK/issues)
- 📚 Docs: [tenlixor.verbytes.com](https://tenlixor.verbytes.com)

## License

MIT © [Verbytes](https://verbytes.com)

## Related SDKs

- 🌐 [TypeScript/JavaScript SDK](../typescript) - Web applications
- 📱 [React Native SDK](../react-native) - React Native apps

---

**Made with ❤️ by the Tenlixor Team of Verbytes**
