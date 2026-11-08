import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/patrick-hand/latin-400.css';
import 'sketchbook-ui/style.css';
import './styles/index.css';
import { App } from './app/App';

const root = document.getElementById('root');
if (!root) throw new Error('The application root element is missing.');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
