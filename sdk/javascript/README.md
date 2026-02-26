# Tenlixor JavaScript SDK

A lightweight, zero-dependency JavaScript SDK for integrating Tenlixor localization into your web applications.

## Features

- ✅ **Zero dependencies** - Pure vanilla JavaScript
- ✅ **Automatic DOM scanning** - Replaces text content with translations automatically
- ✅ **Smart caching** - localStorage with in-memory fallback
- ✅ **Language switching** - Change languages at runtime
- ✅ **Flexible resolution** - Support for exact text matches and data attributes
- ✅ **Error handling** - Graceful fallbacks, never breaks your page
- ✅ **Event system** - Hook into loaded, error, and language-changed events
- ✅ **UMD + ES Module** - Works in any environment

## Installation

### CDN

```html
<!-- Latest version -->
<script src="https://cdn.jsdelivr.net/gh/tenlixor/sdk/javascript/tenlixor.min.js"></script>

<!-- Or use the full version for development -->
<script src="https://cdn.jsdelivr.net/gh/bbesli/Tenlixor/sdk/javascript/tenlixor.js"></script>
```

> **Note:** For TypeScript/NPM users, use `@verbytes-tenlixor/sdk` package instead.

### Download

Download `tenlixor.min.js` and include it in your project:

```html
<script src="/path/to/tenlixor.min.js"></script>
```

## Quick Start

### Basic Usage

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tenlixor Example</title>
  <script src="tenlixor.min.js"></script>
</head>
<body>
  <!-- Method 1: Text content matching -->
  <h1>app.welcome</h1>
  
  <!-- Method 2: Data attribute -->
  <p data-txr-key="app.description"></p>
  
  <button id="lang-btn">Switch to Turkish</button>

  <script>
    // Initialize SDK
    const txr = new Tenlixor({
      token: 'YOUR_API_TOKEN',
      language: 'en'
    });

    // Initialize and auto-scan DOM
    txr.init();

    // Listen for events
    txr.on('loaded', (data) => {
      console.log('Translations loaded:', data);
    });

    txr.on('error', (error) => {
      console.error('Error:', error);
    });

    // Language switcher
    document.getElementById('lang-btn').addEventListener('click', async () => {
      await txr.setLanguage('tr');
      console.log('Language switched to Turkish');
    });

    // Manual translation
    const greeting = txr.t('app.welcome');
    console.log(greeting); // "Welcome to Tenlixor!"
  </script>
</body>
</html>
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `token` | `string` | **(required)** | Your Tenlixor API token |
| `language` | `string` | `'en'` | Default language code |
| `apiUrl` | `string` | `'https://api-tenlixor.verbytes.com/api/v1/strings'` | API base URL |
| `cache` | `boolean` | `true` | Enable caching |
| `cacheTTL` | `number` | `300000` | Cache time-to-live in milliseconds (5 min) |
| `fallbackLanguage` | `string` | `'en'` | Fallback language if key not found |
| `autoScan` | `boolean` | `true` | Automatically scan DOM on init |

### Example with All Options

```javascript
const txr = new Tenlixor({
  token: 'YOUR_API_TOKEN',
  language: 'tr',
  apiUrl: 'https://api-tenlixor.verbytes.com/api/v1/strings',
  cache: true,
  cacheTTL: 600000, // 10 minutes
  fallbackLanguage: 'en',
  autoScan: true
});
```

## API Reference

### `init()`

Initialize the SDK: fetch strings and optionally scan the DOM.

```javascript
await txr.init();
```

**Returns:** `Promise<void>`

---

### `t(key, languageCode?)`

Manually translate a key to its value.

```javascript
const greeting = txr.t('app.welcome');
console.log(greeting); // "Welcome to Tenlixor!"

// Override language
const turkishGreeting = txr.t('app.welcome', 'tr');
```

**Parameters:**
- `key` (string): Translation key
- `languageCode` (string, optional): Language code override

**Returns:** `string` - Translated value or key if not found

---

### `setLanguage(languageCode)`

Change the active language and re-scan the DOM.

```javascript
await txr.setLanguage('tr');
```

**Parameters:**
- `languageCode` (string): New language code

**Returns:** `Promise<void>`

**Events emitted:** `language-changed`, `error` (on failure)

---

### `reload()`

Force reload strings from the API, bypassing cache.

```javascript
await txr.reload();
```

**Returns:** `Promise<void>`

---

### `scan()`

Manually trigger a DOM scan to translate all elements.

```javascript
txr.scan();
```

Useful when you dynamically add new elements to the DOM.

---

### `on(event, callback)`

Register an event listener.

```javascript
txr.on('loaded', (data) => {
  console.log('Loaded:', data.language);
});

txr.on('error', (error) => {
  console.error('Error:', error.code, error.message);
});

txr.on('language-changed', (data) => {
  console.log(`Language changed from ${data.from} to ${data.to}`);
});
```

**Parameters:**
- `event` (string): Event name (`'loaded'`, `'error'`, `'language-changed'`)
- `callback` (function): Callback function

**Events:**
- **loaded**: Fired when strings are loaded. Data: `{ language, reloaded? }`
- **error**: Fired on any error. Data: `{ code, message, error }`
- **language-changed**: Fired when language changes. Data: `{ from, to }`

---

### `off(event, callback)`

Unregister an event listener.

```javascript
function onLoaded(data) {
  console.log('Loaded:', data);
}

txr.on('loaded', onLoaded);
txr.off('loaded', onLoaded); // Remove listener
```

---

### `getLanguage()`

Get the current language code.

```javascript
const currentLang = txr.getLanguage();
console.log(currentLang); // "en"
```

**Returns:** `string`

---

### `getAvailableLanguages()`

Get all loaded language codes.

```javascript
const languages = txr.getAvailableLanguages();
console.log(languages); // ["en", "tr"]
```

**Returns:** `string[]`

---

### `isReady()`

Check if the SDK is initialized and ready.

```javascript
if (txr.isReady()) {
  console.log('SDK is ready to use');
}
```

**Returns:** `boolean`

---

## DOM Auto-Scan

The SDK automatically scans the DOM for translation keys using two methods:

### Method 1: Text Content Matching

The SDK looks for elements whose text content exactly matches a translation key.

```html
<!-- Before -->
<h1>app.welcome</h1>

<!-- After init -->
<h1 data-txr-resolved="true" data-txr-key="app.welcome" data-txr-lang="en">
  Welcome to Tenlixor!
</h1>
```

### Method 2: Data Attribute

Use the `data-txr-key` attribute to explicitly mark elements for translation.

```html
<!-- Before -->
<p data-txr-key="app.description"></p>

<!-- After init -->
<p data-txr-key="app.description" data-txr-resolved="true" data-txr-lang="en">
  Your localization platform made easy.
</p>
```

### Dynamic Content

If you add content dynamically after initialization, call `scan()` again:

```javascript
// Add new element
const newElement = document.createElement('div');
newElement.setAttribute('data-txr-key', 'app.newMessage');
document.body.appendChild(newElement);

// Trigger scan
txr.scan();
```

## Caching Behavior

The SDK uses a two-tier caching strategy:

1. **localStorage** (persistent across sessions)
2. **In-memory** (fallback if localStorage is unavailable)

### Cache Key Pattern

```
txr_{tenant_id}_{language_code}
```

Example: `txr_abc123_en`

### Cache Invalidation

- Cache expires after `cacheTTL` milliseconds (default: 5 minutes)
- Call `reload()` to force refresh
- On network error, stale cache is used as fallback

### Disable Caching

```javascript
const txr = new Tenlixor({
  token: 'YOUR_API_TOKEN',
  cache: false
});
```

## Error Handling

The SDK **never throws errors** that break your page.

### Network Errors

On network failure, the SDK:
1. Emits an `error` event
2. Tries to use cached data (even if expired)
3. Falls back to showing the key itself

```javascript
txr.on('error', (error) => {
  if (error.code === 'UNAUTHORIZED') {
    console.error('Invalid API token');
  } else if (error.code === 'INIT_FAILED') {
    console.error('Failed to initialize:', error.message);
  }
});
```

### Missing Keys

If a translation key is not found:
- The key itself is returned as the value
- No error is thrown or emitted
- Fallback language is checked first

```javascript
const missing = txr.t('non.existent.key');
console.log(missing); // "non.existent.key"
```

## Examples

### Language Selector

```html
<select id="language-selector">
  <option value="en">English</option>
  <option value="tr">Türkçe</option>
  <option value="de">Deutsch</option>
</select>

<script>
  const txr = new Tenlixor({ token: 'YOUR_TOKEN', language: 'en' });
  await txr.init();

  document.getElementById('language-selector').addEventListener('change', async (e) => {
    const lang = e.target.value;
    await txr.setLanguage(lang);
  });

  txr.on('language-changed', (data) => {
    console.log(`Switched from ${data.from} to ${data.to}`);
  });
</script>
```

### SPA (Single Page Application) Integration

```javascript
const txr = new Tenlixor({
  token: 'YOUR_TOKEN',
  language: localStorage.getItem('user-language') || 'en',
  autoScan: false // Disable auto-scan on init
});

await txr.init();

// Router integration
router.afterEach(() => {
  // Scan after each route change
  txr.scan();
});

// Save language preference
txr.on('language-changed', (data) => {
  localStorage.setItem('user-language', data.to);
});
```

### Loading Indicator

```javascript
const txr = new Tenlixor({ token: 'YOUR_TOKEN' });

// Show loader
document.getElementById('loader').style.display = 'block';

txr.on('loaded', () => {
  document.getElementById('loader').style.display = 'none';
});

txr.on('error', (error) => {
  document.getElementById('loader').style.display = 'none';
  alert('Failed to load translations: ' + error.message);
});

await txr.init();
```

### Conditional Translation

```javascript
// Only translate if key exists
function smartTranslate(key) {
  const value = txr.t(key);
  return value !== key ? value : 'Translation not available';
}

console.log(smartTranslate('app.welcome')); // "Welcome to Tenlixor!"
console.log(smartTranslate('missing.key')); // "Translation not available"
```

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+
- Opera 47+

**Required features:**
- `fetch` API
- `Promise`
- `async/await`
- `localStorage` (optional, falls back to in-memory)

For older browsers, include polyfills for `fetch` and `Promise`.

## License

MIT

## Support

- 📧 Email: support@tenlixor.com
- 📖 Documentation: https://documents-tenlixor.verbytes.com/
---

**Made with ❤️ by the Tenlixor Team**
