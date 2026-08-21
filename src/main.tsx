import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import { convexClient } from "./lib/convex";
import "./styles/index.css";
import "./styles/design-tokens.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("MayLamDi could not find the application root.");
}

createRoot(root).render(
  <StrictMode>
    <ConvexAuthProvider client={convexClient}>
      <App />
    </ConvexAuthProvider>
  </StrictMode>,
);
