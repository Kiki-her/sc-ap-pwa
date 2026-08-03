import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { HomePage } from "./pages/HomePage";
import { MistakesPage } from "./pages/MistakesPage";
import { PageLayout } from "./components/common/PageLayout";
import { QuizPage } from "./pages/QuizPage";
import { QuizSettingsPage } from "./pages/QuizSettingsPage";
import { ResultPage } from "./pages/ResultPage";
import { StatsPage } from "./pages/StatsPage";

function App() {
  return (
    <BrowserRouter>
      <PageLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/settings" element={<QuizSettingsPage />} />
          <Route path="/quiz/:sessionId" element={<QuizPage />} />
          <Route path="/result/:sessionId" element={<ResultPage />} />
          <Route path="/mistakes" element={<MistakesPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PageLayout>
    </BrowserRouter>
  );
}

export default App;
