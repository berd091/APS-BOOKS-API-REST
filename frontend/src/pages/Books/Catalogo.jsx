import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Catalogo = () => {
  const [livros, setLivros] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLivros = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get("http://localhost:3001/livros", {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });
        setLivros(response.data);
      } catch (err) {
        setError("Erro ao carregar os livros. Tente novamente.");
      }
    };

    fetchLivros();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Catálogo de Livros</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {livros.length > 0 ? (
        <ul>
          {livros.map((livro) => (
            <li key={livro.id} style={{ marginBottom: "10px" }}>
              <Link to={`/livros/${livro.id}`} style={{ textDecoration: "none", color: "blue" }}>
                <strong>{livro.titulo}</strong> - {livro.autor}{" "}
                {livro.disponivel ? "(Disponível)" : "(Indisponível)"}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum livro encontrado.</p>
      )}
    </div>
  );
};

export default Catalogo;
