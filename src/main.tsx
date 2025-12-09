import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { domProtector } from "./lib/domProtector";

const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// Activar protección completa de página después de que React monte
setTimeout(() => {
  domProtector.enableFullPageProtection();
}, 1000);
