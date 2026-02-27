# Tenlixor Angular Test

Simple Angular test application for Tenlixor SDK.

## Setup

```bash
npm install
```

## Run

```bash
npm start
```

## Test

1. Open http://localhost:4200
2. Check translations
3. Test language switching
4. Verify pipe functionality

## Note

This is a minimal Angular setup. For a full Angular project, use Angular CLI:

```bash
ng new tenlixor-angular-test
cd tenlixor-angular-test
npm install @verbytes-tenlixor/sdk
```

Then add the following to your app.module.ts:

```typescript
import { Tenlixor } from '@verbytes-tenlixor/sdk';
import { TenlixorModule, setTenlixorInstance } from '@verbytes-tenlixor/sdk/angular';

const txr = new Tenlixor({ 
  tenantSlug: 'verbytes',
  token: 'YOUR_API_TOKEN', 
  language: 'en' 
});
txr.init();
setTenlixorInstance(txr);

@NgModule({
  imports: [
    TenlixorModule
  ],
  // ...
})
```

Use in templates:

```html
<h1>{{ 'app.welcome' | txrTranslate }}</h1>
<p>{{ 'app.description' | txrTranslate }}</p>
```
