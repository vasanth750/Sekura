import { Navigate } from "react-router-dom";

// Legacy wrapper kept for reference only.
// NOTE: This component is currently not used by `src/App.jsx`,
// which defines its own in-file `ProtectedRoute` implementation.
export default function ProtectedRoute({ children }) {
  // Legacy auth storage key (unused in active routing flow).
  // Active app flow reads from `sessionStorage` in `src/App.jsx`.
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}