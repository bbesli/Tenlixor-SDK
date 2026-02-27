import { createApp } from 'vue';
import { createTenlixorPlugin } from '@verbytes-tenlixor/sdk/vue';
import App from './App.vue';
import './style.css';

const app = createApp(App);

app.use(createTenlixorPlugin({
  tenantSlug: 'verbytes',
  token: 'sk_7de92730_45a45ff50d1dd6f4e1f28854f2eb0544',
  language: 'en'
}));

app.mount('#app');
