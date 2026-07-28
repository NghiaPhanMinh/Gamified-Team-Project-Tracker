import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from "./App";
import "./index.css";
import { convexUrl } from "./lib/convex";

const app = <StrictMode><App /></StrictMode>;
const root = createRoot(document.getElementById("root"));
root.render(convexUrl ? <ConvexProvider client={new ConvexReactClient(convexUrl)}>{app}</ConvexProvider> : app);
