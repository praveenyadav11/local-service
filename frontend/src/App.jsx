import Layout from "./components/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Providers from "./pages/Providers";
import ProviderDetail from "./pages/ProviderDetail";
import MyBookings from "./pages/MyBookings";
import ProviderDashboard from "./pages/ProviderDashboard";
import ProviderProfile from "./pages/ProviderProfile";
import AdminDashboard from "./pages/AdminDashboard";
import ProviderAvailability from "./pages/ProviderAvailability";
import { Routes, Route, Navigate } from "react-router-dom";
import Settings from "./pages/Settings";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/providers" element={<Providers />} />
        <Route path="/providers/:id" element={<ProviderDetail />} />

        <Route element={<ProtectedRoute roles={["customer"]} />}>
          <Route path="/my-bookings" element={<MyBookings />} />
        </Route>

        <Route element={<ProtectedRoute roles={["provider"]} />}>
          <Route path="/provider/dashboard" element={<ProviderDashboard />} />
          <Route path="/provider/profile" element={<ProviderProfile />} />
          <Route
            path="/provider/availability"
            element={<ProviderAvailability />}
          />
        </Route>

        <Route element={<ProtectedRoute roles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/settings" element={<Settings />} />
          <Route
            path="/change-password"
            element={<Navigate to="/settings" replace />}
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
