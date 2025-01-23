import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddLivro = () => {
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [ano, setAno] = useState("");
  const [sinopse, setSinopse] = useState(""); // Adicionado o estado para sinopse
  const [mensagem, setMensagem] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const verificarPermissao = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get("http://localhost:3001/role", {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });

        if (response.data.role !== "admin") {
          alert("Acesso restrito! Apenas bibliotecários podem acessar esta página.");
          navigate("/"); 
        }
      } catch (error) {
        console.error("Erro ao verificar permissões:", error);
        navigate("/");
      }
    };

    verificarPermissao();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");

    try {
      const token = localStorage.getItem("authToken");

      const novoLivro = {
        titulo,
        autor,
        categoria,
        ano: parseInt(ano, 10),
        sinopse, // Incluído no objeto enviado ao backend
      };

      await axios.post("http://localhost:3001/livros", novoLivro, {
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setMensagem("Livro adicionado com sucesso!");
      setTitulo("");
      setAutor("");
      setCategoria("");
      setAno("");
      setSinopse(""); // Limpar o campo sinopse
    } catch (error) {
      console.error("Erro ao adicionar livro:", error);
      setMensagem("Erro ao adicionar o livro. Tente novamente.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Adicionar Novo Livro</h2>
      {mensagem && <p style={{ color: mensagem.includes("sucesso") ? "green" : "red" }}>{mensagem}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>Título:</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Autor:</label>
          <input
            type="text"
            value={autor}
            onChange={(e) => setAutor(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Categoria:</label>
          <input
            type="text"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Ano:</label>
          <input
            type="number"
            value={ano}
            onChange={(e) => setAno(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Sinopse:</label>
          <textarea
            value={sinopse}
            onChange={(e) => setSinopse(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          ></textarea>
        </div>
        <button type="submit" style={{ padding: "10px 15px", backgroundColor: "blue", color: "white", border: "none", cursor: "pointer" }}>
          Adicionar Livro
        </button>
      </form>
    </div>
  );
};

export default AddLivro;
