import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import RotasPage from "./pages/RotasPage";
import AdminPage from "./pages/AdminPage";
import { GaiolasProvider } from "./context/GaiolasContext";
import BancadasPage from "./pages/BancadasPage";

function App() {
  return (
    <GaiolasProvider>
      <Router>
        <div style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
          {/* Links rápidos para teste */}
          <Link to="/" style={{ marginRight: "1rem" }}>Login</Link>
          <Link to="/dashboard" style={{ marginRight: "1rem" }}>Dashboard</Link>
          <Link to="/admin" style={{ marginRight: "1rem" }}>Admin</Link>
          <Link to="/rotas" style={{ marginRight: "1rem" }}>Rotas</Link>
           <Link to="/bancadas">Bancadas</Link>
        </div>

        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/rotas" element={<RotasPage />} />
          <Route path="/bancadas" element={<BancadasPage />} />
          <Route path="/bancadas/:id" element={<BancadasPage />} />

        </Routes>
      </Router>
    </GaiolasProvider>
  );
}

export default App;
