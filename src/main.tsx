import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { SettingsProvider } from '@/providers/SettingsProvider';
import { DataProvider } from '@/providers/DataProvider';
import { ToastProvider } from '@/components/ui/Toast';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <DataProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </DataProvider>
    </SettingsProvider>
  </StrictMode>,
);
