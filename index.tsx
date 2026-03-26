import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('[MEDLOOP] index.tsx loaded');

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

console.log('[MEDLOOP] root element found, rendering...');

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('[MEDLOOP] render() called successfully');
} catch (err) {
  console.error('[MEDLOOP] RENDER FAILED:', err);
  rootElement.innerHTML = '<div style="color:red;padding:40px;font-size:24px;">RENDER ERROR: ' + (err as any).message + '</div>';
}