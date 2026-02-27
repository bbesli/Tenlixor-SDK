import { useState } from 'react';
import { TenlixorProvider, useTenlixor } from '@verbytes-tenlixor/sdk/react';
import './App.css';

// Test configuration
const TEST_CONFIG = {
  tenantSlug: 'verbytes',
  token: 'sk_7de92730_45a45ff50d1dd6f4e1f28854f2eb0544',
  language: 'en'
};

function TestComponent() {
  const { t, currentLanguage, setLanguage, availableLanguages, isReady, isLoading, error } = useTenlixor();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
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

  if (isLoading) {
    return <div className="loading">Loading translations...</div>;
  }

  if (error) {
    return <div className="error">Error: {error.message}</div>;
  }

  if (!isReady) {
    return <div className="loading">Initializing SDK...</div>;
  }

  return (
    <div className="test-container">
      <h1>🧪 Tenlixor React SDK Test</h1>

      <div className="test-section">
        <h2>1. SDK Status</h2>
        <div className="status-grid">
          <div className="status-item">
            <strong>Ready:</strong> {isReady ? '✅ Yes' : '❌ No'}
          </div>
          <div className="status-item">
            <strong>Loading:</strong> {isLoading ? '⏳ Yes' : '✅ No'}
          </div>
          <div className="status-item">
            <strong>Current Language:</strong> {currentLanguage}
          </div>
          <div className="status-item">
            <strong>Available Languages:</strong> {availableLanguages.join(', ')}
          </div>
        </div>
      </div>

      <div className="test-section">
        <h2>2. Translation Test</h2>
        <div className="translation-test">
          <div className="translation-item">
            <strong>app.welcome:</strong> {t('app.welcome')}
          </div>
          <div className="translation-item">
            <strong>app.description:</strong> {t('app.description')}
          </div>
          <div className="translation-item">
            <strong>Missing key:</strong> {t('non.existent.key')}
          </div>
        </div>
      </div>

      <div className="test-section">
        <h2>3. Language Switching</h2>
        <div className="button-group">
          {availableLanguages.map(lang => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={currentLanguage === lang ? 'active' : ''}
            >
              Switch to {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="test-section">
        <h2>4. Event Logs</h2>
        <div className="logs">
          {logs.length === 0 ? (
            <div className="log-empty">No logs yet. Try switching languages!</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="log-entry">{log}</div>
            ))
          )}
        </div>
        <button onClick={() => setLogs([])}>Clear Logs</button>
      </div>
    </div>
  );
}

function App() {
  return (
    <TenlixorProvider config={TEST_CONFIG}>
      <TestComponent />
    </TenlixorProvider>
  );
}

export default App;
