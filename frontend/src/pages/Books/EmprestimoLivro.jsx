import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  CircularProgress,
} from "@mui/material";
import { BsBookHalf } from "react-icons/bs";
import NavBar from "../../components/navBar/navBar";

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
      navigate("/catalogo");
    } catch (err) {
      setError("Erro ao solicitar o empréstimo. Tente novamente.");
    }
  };

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h5" color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  if (!livro) {
    return (
      <Container sx={{ py: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <div>
      <NavBar />
      <Container sx={{ py: 4 }}>
        <Card
          sx={{
            maxWidth: 800,
            mx: "auto",
            p: 3,
            boxShadow: 4,
            borderRadius: 2,
            backgroundColor: "#EEEEEE",
          }}
        >
          <Box display="flex" alignItems="center" gap={2} sx={{ mb: 3 }}>
            <BsBookHalf size={40} color="#3f51b5" />
            <Typography variant="h4" color="primary">
              {livro.titulo}
            </Typography>
          </Box>

          <CardContent>
            <Box display="flex" flexDirection="column" gap={2}>
              <Typography variant="h6">
                <strong>Autor:</strong> {livro.autor}
              </Typography>
              <Typography variant="h6">
                <strong>Ano:</strong> {livro.ano}
              </Typography>
              <Typography variant="body1" sx={{ textAlign: "justify" }}>
                <strong>Sinopse:</strong>{" "}
                {livro.sinopse || "Sinopse não disponível."}
              </Typography>
              <Typography variant="h6">
                <strong>Local de Coleta:</strong> Cefezes
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: "green", fontWeight: "bold" }}
              >
                <strong>Retorno do livro:</strong> {dataDevolucao}
              </Typography>
            </Box>
          </CardContent>

          <Box display="flex" justifyContent="flex-end" mt={3}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={solicitarEmprestimo}
              sx={{ textTransform: "none" }}
            >
              Confirmar Reserva
            </Button>
          </Box>
        </Card>
      </Container>
    </div>
  );
};

export default EmprestimoLivro;
