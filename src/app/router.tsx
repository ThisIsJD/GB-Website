import { Route, Routes } from 'react-router';
import { NotebookCover } from '../components/notebook/NotebookCover';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<NotebookCover />} />
      <Route path="*" element={<NotebookCover missingDestination />} />
    </Routes>
  );
}
