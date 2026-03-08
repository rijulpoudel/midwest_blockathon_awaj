import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useWallet from "./hooks/useWallet";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SubmitReportPage from "./pages/SubmitReportPage";
import TrackReportPage from "./pages/TrackReportPage";
import GovDashboardPage from "./pages/GovDashboardPage";

export default function App() {
  const { account, connectWallet } = useWallet();

  return (
    <BrowserRouter>
      <div>
        <Navbar account={account} onConnect={connectWallet} />
        <main>
          <Routes>
            <Route
              path="/"
              element={<HomePage account={account} onConnect={connectWallet} />}
            />
            <Route
              path="/submit"
              element={
                <SubmitReportPage account={account} onConnect={connectWallet} />
              }
            />
            <Route
              path="/track"
              element={
                <TrackReportPage account={account} onConnect={connectWallet} />
              }
            />
            <Route
              path="/track/:reportId"
              element={
                <TrackReportPage account={account} onConnect={connectWallet} />
              }
            />
            <Route
              path="/gov-dashboard"
              element={
                <GovDashboardPage account={account} onConnect={connectWallet} />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}