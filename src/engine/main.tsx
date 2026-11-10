import { createRoot } from 'react-dom/client';
import '@fontsource/patrick-hand/latin-400.css';
import '../styles/engine.css';
import { EngineBook } from './EngineBook';
import {
  engineChannel,
  type EngineConfiguration,
} from '../lib/navigation/engineProtocol';

let configured = false;
globalThis.addEventListener('message', async (event: MessageEvent) => {
  if (event.origin !== location.origin || event.source !== parent || configured)
    return;
  if (event.data?.channel !== engineChannel || event.data?.type !== 'configure')
    return;
  configured = true;
  try {
    await document.fonts.load('20px "Patrick Hand"');
    await document.fonts.ready;
    const root = document.getElementById('engine-root');
    if (!root) throw new Error('Notebook page surface is unavailable.');
    createRoot(root).render(
      <EngineBook
        configuration={event.data.configuration as EngineConfiguration}
      />,
    );
  } catch (error) {
    parent.postMessage(
      { channel: engineChannel, type: 'error', message: String(error) },
      location.origin,
    );
  }
});
