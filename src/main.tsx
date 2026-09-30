import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import '@fontsource-variable/hanken-grotesk/wght.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import './index.css';

// Wait (briefly) for the display face so the hero lays out once, with final metrics.
// The boot mark covers this wait; a slow network never blocks longer than the cap.
const fontsReady = Promise.race([
  Promise.all([
    document.fonts.load('400 1rem "Hanken Grotesk Variable"'),
    document.fonts.load('500 1rem "IBM Plex Mono"'),
  ]),
  new Promise((resolve) => setTimeout(resolve, 900)),
]).catch(() => undefined);

fontsReady.then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
