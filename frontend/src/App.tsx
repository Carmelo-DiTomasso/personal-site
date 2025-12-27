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

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/games" element={<GamesPage />} />
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
