import React from 'react'
import ReactDOM from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import App from './App.tsx'
import './index.css'
import { validateEnv, enforceHttps, isDev } from './config/env'

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================
// Validate environment configuration BEFORE rendering app
// This prevents silent failures from misconfiguration
try {
  validateEnv();
  enforceHttps();
} catch (error) {
  // Display user-friendly error message
  const rootEl = document.getElementById('root');
  if (rootEl) {
    rootEl.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 2rem;
        background: linear-gradient(to bottom, #1e3a5f, #0f1419);
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      ">
        <div style="max-width: 600px;">
          <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">
            ⚠️ Configuration Error
          </h1>
          <pre style="
            background: rgba(255, 255, 255, 0.1);
            padding: 1rem;
            border-radius: 0.5rem;
            overflow-x: auto;
            white-space: pre-wrap;
            font-size: 0.875rem;
            line-height: 1.5;
          ">${error instanceof Error ? error.message : 'Unknown configuration error'}</pre>
          <p style="margin-top: 1rem; opacity: 0.8;">
            Contact your system administrator or check the deployment documentation.
          </p>
        </div>
      </div>
    `;
  }
  throw error;
}

// Initialize Capacitor plugins for mobile
if (Capacitor.isNativePlatform()) {
  import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
    StatusBar.setStyle({ style: Style.Dark });
    StatusBar.setBackgroundColor({ color: '#1e3a5f' });
  });

  import('@capacitor/splash-screen').then(({ SplashScreen }) => {
    SplashScreen.hide();
  });
}

// Performance monitoring (dev only)
if (isDev() && typeof window !== 'undefined') {
  const perfStart = performance.now();

  // Log when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const domReadyTime = performance.now() - perfStart;
      console.log(`[Performance] DOM ready in ${domReadyTime.toFixed(2)}ms`);
    });
  } else {
    const domReadyTime = performance.now() - perfStart;
    console.log(`[Performance] DOM already ready, time: ${domReadyTime.toFixed(2)}ms`);
  }

  // Log when page is fully loaded
  window.addEventListener('load', () => {
    const loadTime = performance.now() - perfStart;
    console.log(`[Performance] Page fully loaded in ${loadTime.toFixed(2)}ms`);

    // Log resource timing
    if ('performance' in window && 'getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource');
      const slowResources = resources.filter((r: any) => r.duration > 1000);
      if (slowResources.length > 0) {
        console.warn('[Performance] Slow resources detected:', slowResources.map((r: any) => ({
          name: r.name,
          duration: `${r.duration.toFixed(2)}ms`,
          size: r.transferSize ? `${(r.transferSize / 1024).toFixed(2)}KB` : 'unknown'
        })));
      }
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)



