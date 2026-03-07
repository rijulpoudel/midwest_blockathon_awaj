import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SubmitReportPage from "./pages/SubmitReportPage";
import TrackReportPage from "./pages/TrackReportPage";
import GovDashboardPage from "./pages/GovDashboardPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pb-12">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/submit" element={<SubmitReportPage />} />
            <Route path="/track" element={<TrackReportPage />} />
            <Route path="/gov" element={<GovDashboardPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
