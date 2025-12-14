import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import PrivateRoute from "./auth/PrivateRoute";
import garageBackground from "./assets/garage-background.jpg";

// DASHBOARDS
import ManagerDashboard from "./pages/manager/Dashboard";
import AdvisorDashboard from "./pages/advisor/AdvisorDashboard";
import TechnicianDashboard from "./pages/technician/TechnicianDashboard";
import CashierDashboard from "./pages/cashier/CashierDashboard";

const Layout = ({ children }) => {
  const location = useLocation();

  // Apply background image to body
  useEffect(() => {
    document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${garageBackground})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundRepeat = 'no-repeat';

    return () => {
      // Cleanup on unmount
      document.body.style.backgroundImage = '';
    };
  }, []);

  return (
    <>
      {location.pathname !== "/" && <Navbar />}
      {children}
      <ToastContainer />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* LOGIN */}
          <Route path="/" element={<Login />} />

          {/* MANAGER */}
          <Route
            path="/manager"
            element={
              <PrivateRoute role="manager">
                <ManagerDashboard />
              </PrivateRoute>
            }
          />

          {/* ADVISOR */}
          <Route
            path="/advisor"
            element={
              <PrivateRoute role="advisor">
                <AdvisorDashboard />
              </PrivateRoute>
            }
          />

          {/* TECHNICIAN */}
          <Route
            path="/technician"
            element={
              <PrivateRoute role="technician">
                <TechnicianDashboard />
              </PrivateRoute>
            }
          />

          {/* CASHIER */}
          <Route
            path="/cashier"
            element={
              <PrivateRoute role="cashier">
                <CashierDashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
