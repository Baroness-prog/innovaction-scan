import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Reset minimal + police système (pas de dépendance externe).
const style = document.createElement("style");
style.textContent = `
  * { box-sizing: border-box; }
  html, body, #root { margin: 0; height: 100%; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    color: #3A2E28;
    background: #FAF5EC;
  }
  button { font-family: inherit; }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
