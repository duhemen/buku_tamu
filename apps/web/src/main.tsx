import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { I18nProvider } from '@/lib/i18n';
import { useUIStore } from '@/stores/theme.store';
import './index.css';

function Root() {
  const init = useUIStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <React.StrictMode>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <I18nProvider>
          <App />
        </I18nProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />);