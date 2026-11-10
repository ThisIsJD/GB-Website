import { lazy, Suspense } from 'react';
import { Route, Routes, useLocation } from 'react-router';
import { readNotebookRoute } from '../lib/navigation/notebookRoutes';
import { NotebookCover } from '../components/notebook/NotebookCover';

const ReadingPrototype = lazy(() =>
  import('../components/notebook/ReadingPrototype').then((module) => ({
    default: module.ReadingPrototype,
  })),
);

const EnginePrototype = lazy(() =>
  import('../prototypes/EnginePrototype').then((module) => ({
    default: module.EnginePrototype,
  })),
);

const AnalysisPrototype = lazy(() =>
  import('../prototypes/AnalysisPrototype').then((module) => ({
    default: module.AnalysisPrototype,
  })),
);

const CanonicalPagination = lazy(() =>
  import('../prototypes/CanonicalPagination').then((module) => ({
    default: module.CanonicalPagination,
  })),
);

const ComposedPortfolio = lazy(() =>
  import('../prototypes/ComposedPortfolio').then((module) => ({
    default: module.ComposedPortfolio,
  })),
);

const NotebookReader = lazy(() =>
  import('./NotebookReader').then((module) => ({
    default: module.NotebookReader,
  })),
);

function NotebookRoute() {
  const route = useLocation();
  return readNotebookRoute(route.pathname, route.search) ? (
    <NotebookReader />
  ) : (
    <NotebookCover missingDestination />
  );
}

export function AppRoutes() {
  return (
    <Suspense
      fallback={
        <main id="main-content" className="reading-stage" tabIndex={-1}>
          <p role="status">Arranging the pages...</p>
        </main>
      }
    >
      <Routes>
        <Route path="/" element={<NotebookCover />} />
        <Route path="/notebook" element={<NotebookRoute />} />
        <Route path="/profile" element={<NotebookRoute />} />
        <Route path="/analyses" element={<NotebookRoute />} />
        <Route path="/analyses/:slug" element={<NotebookRoute />} />
        <Route path="/favorite" element={<NotebookRoute />} />
        <Route path="/learning" element={<NotebookRoute />} />
        <Route path="/reflection" element={<NotebookRoute />} />
        <Route path="/prototype" element={<ReadingPrototype />} />
        <Route path="/prototype/book" element={<EnginePrototype />} />
        <Route path="/prototype/analysis" element={<AnalysisPrototype />} />
        <Route path="/prototype/content" element={<CanonicalPagination />} />
        <Route path="/prototype/composition" element={<ComposedPortfolio />} />
        <Route path="*" element={<NotebookCover missingDestination />} />
      </Routes>
    </Suspense>
  );
}
