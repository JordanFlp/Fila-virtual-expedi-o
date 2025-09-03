import { logoutUser } from "../services/authService";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "5rem" }}>
      <h1>Dashboard</h1>
      <p>Bem-vindo ao sistema de filas e rotas!</p>
      <button onClick={handleLogout}>Sair</button>
    </div>
  );
};

export default DashboardPage;
