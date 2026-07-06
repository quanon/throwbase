import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// No <StrictMode>: it double-invokes effects in dev, which would spin up
// two DuckDB workers and try to CREATE TABLE twice.
createRoot(document.getElementById("root")).render(<App />);
