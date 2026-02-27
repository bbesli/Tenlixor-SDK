# Tenlixor SDK Test Suite

Comprehensive test suite for all Tenlixor SDK implementations.

## Test Structure

```
test/
├── javascript-test/        # Vanilla JavaScript SDK test
├── react-test/            # React Hooks integration test
├── vue-test/              # Vue 3 plugin integration test
└── angular-test/          # Angular module test (documentation)
```

## Prerequisites

1. Build the TypeScript SDK first:
```bash
cd sdk/typescript
npm install
npm run build
```

## Running Tests

### 1. JavaScript Test

The JavaScript test is a standalone HTML file that can be opened directly in a browser.

**Option A: Using Live Server (VS Code extension)**
```bash
cd test/javascript-test
# Right-click on index.html and select "Open with Live Server"
```

**Option B: Using Python HTTP server**
```bash
cd test/javascript-test
python -m http.server 5500
# Open http://localhost:5500/index.html
```

**Tests included:**
- SDK initialization
- Translation methods (text matching, data attributes, manual)
- Language switching
- API methods (getLanguage, getAvailableLanguages, isReady, reload)
- Event system
- Cache functionality

### 2. React Test

```bash
cd test/react-test
npm install
npm run dev
# Open http://localhost:3001
```

**Tests included:**
- TenlixorProvider setup
- useTenlixor() hook
- Translation rendering
- Language switching
- State management
- Loading and error states

**Framework versions:**
- React 18.2.0
- TypeScript 5.3.0
- Vite 5.0.0

### 3. Vue Test

```bash
cd test/vue-test
npm install
npm run dev
# Open http://localhost:3002
```

**Tests included:**
- Tenlixor plugin installation
- Composition API (useTenlixorTranslate)
- Options API ($t, $txr)
- Translation rendering
- Language switching
- Reactive state management

**Framework versions:**
- Vue 3.3.0
- TypeScript 5.3.0
- Vite 5.0.0

### 4. Angular Test

Angular requires a full CLI setup. See `angular-test/README.md` for manual setup instructions.

**Key features to test:**
- TenlixorModule import
- txrTranslate pipe
- Instance setup with setTenlixorInstance()
- Template bindings
- Language switching

## Test Configuration

All tests use the following configuration:

```javascript
{
  tenantSlug: 'verbytes',
  token: 'de92730_45a45ff50d1dd6f4e1f28854f2eb0544',
  language: 'en'
}
```

**⚠️ Important:** Replace these credentials with your own Tenlixor API credentials.

## What to Test

### Core Functionality
- ✅ SDK initialization with tenantSlug and token
- ✅ Translation loading from API
- ✅ Text content matching (DOM scanning)
- ✅ Data attribute translation
- ✅ Manual translation with t()
- ✅ Language switching
- ✅ Cache functionality
- ✅ Error handling

### API Methods
- ✅ `t(key, languageCode?)` - Translation
- ✅ `setLanguage(code)` - Change language
- ✅ `getLanguage()` - Get current language
- ✅ `getAvailableLanguages()` - Get loaded languages
- ✅ `isReady()` - Check initialization status
- ✅ `reload()` - Refresh translations

### Events
- ✅ `loaded` - Triggered when translations load
- ✅ `error` - Triggered on errors
- ✅ `language-changed` - Triggered on language change

### Framework-Specific

**React:**
- ✅ TenlixorProvider context
- ✅ useTenlixor() hook
- ✅ useTranslate() hook
- ✅ useLanguage() hook
- ✅ Reactive state updates

**Vue:**
- ✅ Plugin installation
- ✅ useTenlixor() composable
- ✅ useTenlixorTranslate() composable
- ✅ $t() global property (Options API)
- ✅ $txr instance access
- ✅ Reactive state updates

**Angular:**
- ✅ TenlixorModule import
- ✅ txrTranslate pipe
- ✅ Instance injection
- ✅ Template bindings

## Expected Results

### Success Indicators
1. **Initialization**: SDK loads without errors
2. **Translations**: Keys are replaced with actual translations
3. **Language Switch**: Content updates when language changes
4. **Cache**: Translations persist across page reloads
5. **Error Handling**: Network errors don't break the application

### Common Issues

**404 Not Found on API calls:**
- Check your tenant slug and API token
- Verify the API endpoint is accessible
- Check network tab in browser DevTools

**Translations not updating:**
- Check if SDK is initialized (isReady should be true)
- Verify language code exists in available languages
- Check browser console for errors

**React/Vue build errors:**
- Ensure TypeScript SDK is built: `cd sdk/typescript && npm run build`
- Check that @verbytes-tenlixor/sdk is properly linked
- Try clearing node_modules and reinstalling

## Debugging

### Browser DevTools
1. Open DevTools (F12)
2. Check Console tab for errors and logs
3. Check Network tab for API requests
4. Inspect localStorage for cached data

### API Request Headers
The SDK should send these headers:
```
X-Tenant-Slug: verbytes
X-API-Key: de92730_45a45ff50d1dd6f4e1f28854f2eb0544
Content-Type: application/json
```

### Cache Keys
Check localStorage for keys like:
```
txr_{tenant_id}_en
txr_{tenant_id}_tr
```

## Test Results Template

Use this template to document your test results:

```markdown
## Test Results - [Date]

### JavaScript Test
- [ ] SDK initialization: Pass/Fail
- [ ] Translation loading: Pass/Fail
- [ ] Language switching: Pass/Fail
- [ ] Cache: Pass/Fail
- [ ] Events: Pass/Fail
- Notes: 

### React Test
- [ ] Provider setup: Pass/Fail
- [ ] Hooks working: Pass/Fail
- [ ] State updates: Pass/Fail
- [ ] Language switching: Pass/Fail
- Notes:

### Vue Test
- [ ] Plugin installation: Pass/Fail
- [ ] Composables working: Pass/Fail
- [ ] Options API working: Pass/Fail
- [ ] State updates: Pass/Fail
- Notes:

### Issues Found
1. 
2. 
3. 

### Recommended Actions
1. 
2. 
3. 
```

## Next Steps

After testing:
1. Document any issues found
2. Fix critical bugs in SDK
3. Update SDK version if changes made
4. Re-run tests to verify fixes
5. Update documentation

## Support

For issues related to:
- **SDK bugs**: Check GitHub issues or create a new one
- **API problems**: Contact Tenlixor support
- **Framework integration**: Check framework-specific documentation

## License

MIT
