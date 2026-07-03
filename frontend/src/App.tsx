import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "@/routes/ProtectedRoutes";

import Login from "@/pages/Login";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import ApplyLeave from "./pages/employee/ApplyLeave";
import LeaveHistory from "./pages/employee/LeaveHistory";
import LeaveDetails from "./pages/LeaveDetails"; 
import EmployeeProfile from "./pages/employee/EmployeeProfile";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import PendingApprovals from "./pages/manager/PendingApprovals";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Employee-only */}
          <Route element={<ProtectedRoute allowedRoles={["EMPLOYEE"]} />}>
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee/apply-leave" element={<ApplyLeave />} />
            <Route path="/employee/leave-history" element={<LeaveHistory />} />
            <Route path="/employee/profile" element={<EmployeeProfile />} />
          </Route>

          {/* Manager-only */}
          <Route element={<ProtectedRoute allowedRoles={["MANAGER"]} />}>
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/pending-approvals" element={<PendingApprovals />} />
          </Route>

          {/* Shared — any authenticated user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/leaves/:id" element={<LeaveDetails />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;