import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./AuthContext";
import { colors, font } from "./theme";

// Global page styles applied from JS (no CSS file).
Object.assign(document.body.style, {
  margin: "0",
  fontFamily: font,
  background: colors.bg,
  color: colors.text,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
