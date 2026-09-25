import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Landing from "./pages/landing/landing";
import Auth from "./pages/auth/auth";
import Dashboard from "./pages/dashboard/dashboard";
import PlanTrack from "./pages/plantrack/plantrack";
import Insights from "./pages/insights/insights";
import Profile from "./pages/profile/profile";
import Calendar from "./pages/calendar/calendar";

import CinematicBackground from "./components/CinematicBackground";


/* ==================================================
   PROTECTED ROUTE
   ================================================== */

function ProtectedRoute({ children }) {
  const token =
    localStorage.getItem("timelens_token");

  if (!token) {
    return (
      <Navigate
        to="/auth"
        replace
      />
    );
  }

  return children;
}


/* ==================================================
   ROOT ROUTE
   ================================================== */

function RootRoute() {
  const token =
    localStorage.getItem("timelens_token");

  if (token) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return (
    <Navigate
      to="/auth"
      replace
    />
  );
}


/* ==================================================
   APP
   ================================================== */

function App() {
  return (
    <BrowserRouter>

      {/* ==================================================
          GLOBAL CINEMATIC BACKGROUND
      ================================================== */}

      <CinematicBackground />


      <Routes>

        {/* ------------------------------------------
            ROOT
            ------------------------------------------ */}

        <Route
          path="/"
          element={<RootRoute />}
        />


        {/* ------------------------------------------
            LANDING PAGE
            ------------------------------------------ */}

        <Route
          path="/landing"
          element={<Landing />}
        />


        {/* ------------------------------------------
            AUTHENTICATION
            ------------------------------------------ */}

        <Route
          path="/auth"
          element={<Auth />}
        />


        {/* ------------------------------------------
            DASHBOARD
            ------------------------------------------ */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* ------------------------------------------
            PLAN & TRACK
            ------------------------------------------ */}

        <Route
          path="/plan-track"
          element={
            <ProtectedRoute>
              <PlanTrack />
            </ProtectedRoute>
          }
        />


        {/* ------------------------------------------
            CALENDAR
            ------------------------------------------ */}

        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          }
        />


        {/* ------------------------------------------
            INSIGHTS
            ------------------------------------------ */}

        <Route
          path="/insights"
          element={
            <ProtectedRoute>
              <Insights />
            </ProtectedRoute>
          }
        />


        {/* ------------------------------------------
            PROFILE
            ------------------------------------------ */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />


        {/* ------------------------------------------
            UNKNOWN ROUTE
            ------------------------------------------ */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;