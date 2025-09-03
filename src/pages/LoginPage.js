import { useState } from "react";
import { loginUser } from "../services/authService";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginUser(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Falha no login. Verifique email e senha.");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "5rem" }}>
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
};

export default LoginPage;
