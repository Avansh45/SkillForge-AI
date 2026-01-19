import React from "react";
import Settings from "./Settings";
import { getUserSession, logout, isAuthenticated } from "../utils/auth";
import { useNavigate, Navigate } from "react-router-dom";

const SettingsPage = () => {
  const user = getUserSession();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const handleBackToDashboard = () => {
    if (!user?.role) return navigate("/");
    const normalizedRole = user.role.toLowerCase();
    if (normalizedRole === "student") navigate("/student-dashboard");
    else if (normalizedRole === "admin") navigate("/admin-dashboard");
    else if (normalizedRole === "instructor") navigate("/instructor-dashboard");
    else navigate("/");
  };
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return (
    <Settings user={user} role={user?.role} handleLogout={handleLogout} onBackToDashboard={handleBackToDashboard} />
  );
};

export default SettingsPage;
