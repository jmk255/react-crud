import { createContext, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CareerPage from "./pages/dashboard/career";
import ActivityPage from "./pages/dashboard/activity";
import JoinPage from "./pages/auth/signup";
import LoginPage from "./pages/auth/login";
import ActivityDetailPage from "./pages/dashboard/activityDetail";
import ActivityWritePage from "./pages/dashboard/activityWrite";
import ActivityUpdatePage from "./pages/dashboard/activityUpdate";
import OverviewPage from "./pages/dashboard/overview";

export const UserContext = createContext();

function App() {
  
  const [accessToken, setAccessToken ] = useState(null);

  return (
    <UserContext.Provider value={ {accessToken, setAccessToken} }>
      <Router>
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/career" element={<CareerPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/activity/:id" element={<ActivityDetailPage />} />
          <Route path="/activityWrite" element={<ActivityWritePage />} />
          <Route path="/activityUpdate/:id" element={<ActivityUpdatePage />} />
        </Routes>
      </Router>
    </UserContext.Provider>
  );
}

export default App;