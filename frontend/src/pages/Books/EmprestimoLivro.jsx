import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const EmprestimoLivro = () => {
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
            <strong>Ano:</strong> 1978{/* {livro.ano} */}
          </p>
          <p>
            <strong>Editora:</strong> Companhia das Letras
            {/* {livro.editora} */}
          </p>
          <p>
            <strong>Local de Coleta:</strong> Cefezes{/* {livro.biblioteca} */}
          </p>
          <p>
            <strong>Retorno do livro:</strong> 30/01/25
            {/* da pra botar 14 dias apos solicitação de algum jeito? */}
          </p>
          <button>Confirmar Reserva</button>
        </div>
      ) : (
        !error && <p>Carregando...</p>
      )}
    </div>
  );
};

export default EmprestimoLivro;
