import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Notifications from "./pages/Notifications";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Roles from "./pages/Roles";
import Permissions from "./pages/Permissions";
import Register from "./pages/Register";
import Companies from "./pages/Companies";
import Jobs from "./pages/Jobs";

const MainLayout = ({ children }) => {
  return (
    <div>
      <Navbar />
      <main>{children}</main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/" element={<Navigate to="/notifications" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dash" element={<Dashboard />} /> {/* This route bypasses protection */}

          {/* This route uses a nested structure for the protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
            <Route path="/companies" element={<MainLayout><Companies /></MainLayout>} />
            <Route path="/jobs" element={<MainLayout><Jobs /></MainLayout>} />
            <Route path="/users" element={<MainLayout><Users /></MainLayout>} />
            <Route path="/roles" element={<MainLayout><Roles /></MainLayout>} />
            <Route path="/permissions" element={<MainLayout><Permissions /></MainLayout>} />
            <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/notifications" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;