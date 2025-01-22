import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:3001/auth/login", formData);
      if (response.status === 200) {
        const { token } = response.data;
        localStorage.setItem("authToken", token);
        alert("Login realizado com sucesso!");
        navigate("/catalogo");
      }
    } catch (err) {
      setError("Email ou senha inválidos.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Senha:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Entrar</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <p style={{ marginTop: "20px" }}>
        Não tem cadastro?{" "}
        <Link to="/cadastro" style={{ color: "blue", textDecoration: "underline" }}>
          Cadastre-se agora!
        </Link>
      </p>
    </div>
  );
};

export default Login;
