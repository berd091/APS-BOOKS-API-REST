import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EmprestimoLivro = () => {
  const { id } = useParams(); 
  const navigate = useNavigate(); 
  const [livro, setLivro] = useState(null);
  const [error, setError] = useState("");
  const [dataDevolucao, setDataDevolucao] = useState("");

  const calcularDataDevolucao = () => {
    const hoje = new Date();
    const devolucao = new Date();
    devolucao.setDate(hoje.getDate() + 15);
    return devolucao.toLocaleDateString("pt-BR", { timeZone: "UTC" });
  };

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
        setDataDevolucao(calcularDataDevolucao()); 
      } catch (err) {
        setError("Erro ao carregar os detalhes do livro.");
      }
    };

    fetchLivro();
  }, [id]);

 
  const solicitarEmprestimo = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        `http://localhost:3001/emprestimo/${livro.livroId}`,
        {},
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Empréstimo solicitado com sucesso!");
      navigate("/");
    } catch (err) {
      setError("Erro ao solicitar o empréstimo. Tente novamente.");
    }
  };

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
            <strong>Ano:</strong> {livro.ano}
          </p>
          <p>
            <strong>Sinopse:</strong> {livro.sinopse}
          </p>
          <p>
            <strong>Local de Coleta:</strong> Cefezes
          </p>
          <p>
            <strong>Retorno do livro:</strong> {dataDevolucao}
          </p>
          <button onClick={solicitarEmprestimo} style={{ padding: "10px 20px", cursor: "pointer" }}>
            Confirmar Reserva
          </button>
        </div>
      ) : (
        !error && <p>Carregando...</p>
      )}
    </div>
  );
};

export default EmprestimoLivro;
