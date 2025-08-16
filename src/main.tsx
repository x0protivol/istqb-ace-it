import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// In development, proactively clear any service workers and caches to avoid stale bundles
if (!import.meta.env.PROD && 'serviceWorker' in navigator) {
	navigator.serviceWorker.getRegistrations().then((regs) => {
		for (const r of regs) r.unregister()
	}).catch(() => {})
	if ('caches' in window) {
		caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {})
	}
}

// Register service worker only in production to avoid interfering with Vite dev
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/sw.js')
			.then((registration) => {
				console.log('SW registered: ', registration);
			})
			.catch((registrationError) => {
				console.log('SW registration failed: ', registrationError);
			});
	});
}

const container = document.getElementById('root');
if (!container) throw new Error('Root container missing');
createRoot(container).render(<App />);
