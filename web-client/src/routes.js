import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { useContext } from "react";
import { ApiClientContext } from "./contexts";

import AdminPage from "./page/admin";
import HomePage from "./page/home";
import LoginPage from "./page/login";

import { Navigate, Outlet } from "react-router-dom";
const AuthRoutes = () => {
  return this.props.apiClient.isAuthenticated() ? (
    <Outlet />
  ) : (
    <Navigate to="/login" />
  );
};

function AppRoutes() {
  let apiClient = useContext(ApiClientContext);
  return (
    <Router>
      <Routes>
        <Route element={<AuthRoutes apiClient={apiClient} />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>{" "}
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
