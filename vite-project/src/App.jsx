import {
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import Signup from "./Pages/Signup.jsx";
import Login from "./Pages/Login.jsx";
import Footer from "./components/footer/footer.jsx";
import Header from "./components/header/header.jsx";
import Secrets from "./Pages/Secrets.jsx";
import CreateRequest from "./Pages/Request.jsx";
import RequestViewr from "./Pages/RequestViewing.jsx";
import CreateSecretLinkPage from "./Pages/CreateSecretLink.jsx";

import Privacy from "./components/footer/Privacy.jsx";
import Terms from "./components/footer/Terms.jsx";
import Contact from "./components/footer/Contact.jsx";
import Dashboard from "./Pages/dashBoard.jsx";

function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function Layout() {
  const location = useLocation();

  const hideHeaderRoutes = ["/login", "/signup"];
  const hideFooterRoutes = ["/login", "/signup"];

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-slate-950 text-slate-100">
      {!hideHeaderRoutes.includes(location.pathname) && <Header />}

      <main className="relative z-10 flex-1 overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<Login />} />

          <Route path="/signup" element={<Signup />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/secrets"
            element={
              <ProtectedRoute>
                <Secrets />
              </ProtectedRoute>
            }
          />

          <Route
            path="/request"
            element={
              <ProtectedRoute>
                <CreateRequest />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-link"
            element={
              <ProtectedRoute>
                <CreateSecretLinkPage />
              </ProtectedRoute>
            }
          />

          <Route path="/request/:id" element={<RequestViewr />} />

          <Route path="/privacy-policy" element={<Privacy />} />

          <Route path="/terms-condition" element={<Terms />} />

          <Route path="/contact-us" element={<Contact />} />
        </Routes>
      </main>

      {!hideFooterRoutes.includes(location.pathname) && (
        <div className="relative z-0">
          <Footer />
        </div>
      )}
    </div>
  );
}

export default function App() {
  return <Layout />;
}
