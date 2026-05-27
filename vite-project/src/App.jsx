import {
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Signup from "./Pages/Signup.jsx";
import Login from "./Pages/Login.jsx";
import Footer from "./components/footer/footer.jsx";
import Header from "./components/header/header.jsx";
import Secrets from "./Pages/Secrets.jsx";
import CreateRequest from "./Pages/Request.jsx";
import RequestViewr from "./Pages/RequestViewing.jsx";
import CreateSecretLinkPage from "./Pages/CreateSecretLink.jsx";
import LiveSessionJoin from "./Pages/LiveSessionJoin.jsx";

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
  const isSessionJoinRoute = location.pathname.startsWith("/session/");
  const isRequestViewingRoute = /^\/request\/[^/]+/.test(location.pathname);
  const shouldHideHeader =
    hideHeaderRoutes.includes(location.pathname) ||
    isSessionJoinRoute ||
    isRequestViewingRoute;
  const shouldHideFooter =
    hideFooterRoutes.includes(location.pathname) ||
    isSessionJoinRoute ||
    isRequestViewingRoute;

  return (
    <div className="sekura-app-shell flex min-h-screen flex-col overflow-x-hidden text-slate-950 dark:text-slate-100">
      {!shouldHideHeader && <Header />}

      <main className={`relative z-10 flex-1 overflow-x-hidden ${shouldHideHeader ? "" : "pt-16 lg:pt-[4.5rem]"}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="min-h-full"
          >
            <Routes location={location}>
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

              <Route
                path="/live-session"
                element={<Navigate to="/create-link" replace />}
              />

              <Route path="/session/:id" element={<LiveSessionJoin />} />

              <Route path="/request/:id" element={<RequestViewr />} />

              <Route path="/privacy-policy" element={<Privacy />} />

              <Route path="/terms-condition" element={<Terms />} />

              <Route path="/contact-us" element={<Contact />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {!shouldHideFooter && (
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
