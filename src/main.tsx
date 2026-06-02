import "./index.css";
import "@fontsource/inter";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { setupInterceptors } from "@/shared/api";

import { App } from "./app/app";

setupInterceptors();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
