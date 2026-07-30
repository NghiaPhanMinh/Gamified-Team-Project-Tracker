import { StrictMode } from "react";
import { ConvexProvider } from "convex/react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import { convexClient } from "./lib/convex";
import "./styles/index.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("MayLamDi could not find the application root.");
}

createRoot(root).render(
  <StrictMode>
    <ConvexProvider client={convexClient}>
      <App />
    </ConvexProvider>
  </StrictMode>,
);
