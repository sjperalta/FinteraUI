import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/browser";
import App from "./App.jsx";
import "./assets/css/style.css";
import "./assets/css/font-awesome-all.min.css";
import "./index.css";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "quill/dist/quill.snow.css";
import { AuthProvider } from './context/AuthContext.jsx';

import { registerSW } from "virtual:pwa-register";

if (import.meta.env.MODE === "production") {
  registerSW();
}

Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
  </React.StrictMode>
);
