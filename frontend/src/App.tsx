import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/home/HomePage';
import { ResumePage } from './pages/resume/ResumePage';
import { ProjectsPage } from './pages/projects/ProjectsPage';
import { GamesPage } from './pages/games/GamesPage';
import { ContactPage } from './pages/contact/ContactPage';
import { SitePage } from './pages/site/SitePage';
import { StatsPage } from './pages/stats/StatsPage';
import { SimplePage } from './pages/shared/SimplePage';
import { BipPage } from './pages/games/BipPage/BipPage';
import { BangoPage } from './pages/games/BangoPage/BangoPage';
import { BeensPage } from './pages/games/BeensPage/BeensPage';
import { SudokuPage } from './pages/games/SudokuPage/SudokuPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/games/bip" element={<BipPage />} />
          <Route path="/games/bango" element={<BangoPage />} />
          <Route path="/games/beens" element={<BeensPage />} />
          <Route path="/games/sudoku" element={<SudokuPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/site" element={<SitePage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route
            path="*"
            element={
              <SimplePage title="Not Found">
                <p>This page does not exist.</p>
              </SimplePage>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
