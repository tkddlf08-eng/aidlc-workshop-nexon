import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { CONFIG } from '@shared/constants/config';

async function bootstrap() {
  // Enable MSW in development mode
  if (CONFIG.IS_DEV && CONFIG.ENABLE_MSW) {
    const { worker } = await import('./mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap();
