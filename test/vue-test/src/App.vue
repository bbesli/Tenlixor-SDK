<template>
  <div class="test-container">
    <h1>🧪 Tenlixor Vue SDK Test</h1>

    <div v-if="!isReady" class="loading">
      Initializing SDK...
    </div>

    <template v-else>
      <div class="test-section">
        <h2>1. SDK Status</h2>
        <div class="status-grid">
          <div class="status-item">
            <strong>Ready:</strong> {{ isReady ? '✅ Yes' : '❌ No' }}
          </div>
          <div class="status-item">
            <strong>Current Language:</strong> {{ currentLanguage }}
          </div>
          <div class="status-item">
            <strong>Available Languages:</strong> {{ availableLanguages.join(', ') }}
          </div>
        </div>
      </div>

      <div class="test-section">
        <h2>2. Translation Test (Composition API)</h2>
        <div class="translation-test">
          <div class="translation-item">
            <strong>app.welcome:</strong> {{ t('app.welcome') }}
          </div>
          <div class="translation-item">
            <strong>app.description:</strong> {{ t('app.description') }}
          </div>
          <div class="translation-item">
            <strong>Missing key:</strong> {{ t('non.existent.key') }}
          </div>
        </div>
      </div>

      <div class="test-section">
        <h2>3. Translation Test (Options API)</h2>
        <div class="translation-test">
          <div class="translation-item">
            <strong>app.welcome (Options):</strong> {{ $t('app.welcome') }}
          </div>
          <div class="translation-item">
            <strong>app.description (Options):</strong> {{ $t('app.description') }}
          </div>
        </div>
      </div>

      <div class="test-section">
        <h2>4. Language Switching</h2>
        <div class="button-group">
          <button
            v-for="lang in availableLanguages"
            :key="lang"
            @click="handleLanguageChange(lang)"
            :class="{ active: currentLanguage === lang }"
          >
            Switch to {{ lang.toUpperCase() }}
          </button>
        </div>
      </div>

      <div class="test-section">
        <h2>5. Event Logs</h2>
        <div class="logs">
          <div v-if="logs.length === 0" class="log-empty">
            No logs yet. Try switching languages!
          </div>
          <div v-else v-for="(log, index) in logs" :key="index" class="log-entry">
            {{ log }}
          </div>
        </div>
        <button @click="logs = []">Clear Logs</button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTenlixorTranslate } from '@verbytes-tenlixor/sdk/vue';

const { t, currentLanguage, setLanguage, availableLanguages, isReady } = useTenlixorTranslate();
const logs = ref<string[]>([]);

const addLog = (message: string) => {
  logs.value.push(`[${new Date().toLocaleTimeString()}] ${message}`);
};

const handleLanguageChange = async (lang: string) => {
  try {
    addLog(`Switching to ${lang}...`);
    await setLanguage(lang);
    addLog(`✅ Successfully switched to ${lang}`);
  } catch (err) {
    addLog(`❌ Failed to switch language: ${err}`);
  }
};
</script>
