import { BrowserRouter } from 'react-router';
import { SketchProvider } from 'sketchbook-ui';
import { AppRoutes } from './router';

export function App() {
  return (
    <SketchProvider>
      <BrowserRouter>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <AppRoutes />
      </BrowserRouter>
    </SketchProvider>
  );
}
