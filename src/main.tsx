import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
if (container) {
    createRoot(container).render(
        <StrictMode>
            <App />
        </StrictMode>
    );
}

// The initial-loader div in index.html renders before React mounts (see the
// inline script there) but nothing ever removes it afterward — that was
// missed when the branded shell was ported over. Fade it out and remove it
// once React has taken over.
const loader = document.getElementById('initial-loader');
if (loader) {
    loader.classList.add('fade-out');
    setTimeout(() => loader.remove(), 300);
}
