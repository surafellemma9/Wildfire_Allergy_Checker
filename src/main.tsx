import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Performance monitoring
if (typeof window !== 'undefined') {
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



