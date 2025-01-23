import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";

const DetalhesLivro = () => {
  const { id } = useParams();
  const [livro, setLivro] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLivro = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(`http://localhost:3001/livros/${id}`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });
        setLivro(response.data);
      } catch (err) {
        setError("Erro ao carregar os detalhes do livro.");
      }
    };

    fetchLivro();
  }, [id]);

  return (
    <div style={{ padding: "20px" }}>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {livro ? (
        <div>
          <h2>{livro.titulo}</h2>
          <p>
            <strong>Autor:</strong> {livro.autor}
          </p>
          <p>
            <strong>Categoria:</strong> {livro.categoria}
          </p>
          <p>
            <strong>Ano:</strong> {livro.ano}
          </p>
          <p>
            <strong>Sinopse:</strong> {livro.sinopse}
            {/* {livro.editora} */}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            {livro.disponivel ? "Disponível" : "Indisponível"}
          </p>
          <Link
            to={`/emprestimo/${livro.livroId}`}
            style={{ textDecoration: "none", color: "blue" }}
          >
            <button>Reservar</button>
          </Link>
        </div>
      ) : (
        !error && <p>Carregando...</p>
      )}
    </div>
  );
};

export default DetalhesLivro;
