import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { setToken } from "./api/api";

const token = localStorage.getItem("token");
if (token) setToken(token);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);