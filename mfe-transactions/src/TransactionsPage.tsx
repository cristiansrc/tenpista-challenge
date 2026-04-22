import "./index.css";

// Componente expuesto via Module Federation.
// Se renderiza dentro del contexto de Refine del shell (providers compartidos como singletons).
export { default } from "./pages/transactions";
