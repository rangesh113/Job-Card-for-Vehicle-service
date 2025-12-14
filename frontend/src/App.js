import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import PrivateRoute from "./auth/PrivateRoute";

// DASHBOARDS
import ManagerDashboard from "./pages/manager/Dashboard";
import AdvisorDashboard from "./pages/advisor/AdvisorDashboard";
import TechnicianDashboard from "./pages/technician/TechnicianDashboard";
import CashierDashboard from "./pages/cashier/CashierDashboard";

const Layout = ({ children }) => {
  const location = useLocation();

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
