// Legacy page — live session host UI was merged into CreateSecretLink.jsx
// (protected mode). Route /live-session redirects to /create-link.
// Kept only so existing imports do not break during cleanup.

import { Navigate } from "react-router-dom";

export default function LiveSessionHost() {
  return <Navigate to="/create-link" replace />;
}
