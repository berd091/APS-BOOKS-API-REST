import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Grid2,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  CardMedia,
  Button,
} from "@mui/material";
import NavBar from "../../components/navBar/navBar";

const getMensagemDevolucao = (dataDevolucao) => {
  const hoje = new Date();
  const dataDevolucaoDate = new Date(dataDevolucao);
  const diffEmDias = Math.ceil(
    (dataDevolucaoDate - hoje) / (1000 * 60 * 60 * 24)
  );

  if (diffEmDias < 0) {
    return "Prazo para devolução vencido, favor procurar a Biblioteca para devolvê-lo, sujeito a multa por não devolução";
  } else if (diffEmDias === 0) {
    return "Hoje é o último dia para a devolução";
  } else if (diffEmDias <= 7) {
    return `Faltam ${diffEmDias} dia(s) para a devolução`;
  }
  return null;
};

const HistoricoEmprestimos = () => {
  const [emprestimos, setEmprestimos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchBookCover = async (titulo) => {
    try {
      const response = await axios.get(
        "https://www.googleapis.com/customsearch/v1",
        {
          params: {
            key: "AIzaSyCHtiaMFIZqa0AP_ps2T-P-vD2SC5MA6O8",
            cx: "44c5ec16575214cc3",
            q: `${titulo} livro`,
            searchType: "image",
            num: 1,
          },
        }
      );
      return response.data.items?.[0]?.link || null;
    } catch (error) {
      console.error(
        `Erro ao buscar capa para o livro "${titulo}":`,
        error.message
      );
      return null;
    }
  };

  const handleExtendLoan = async (emprestimoId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Token de autenticação não encontrado.");
      }

      const response = await axios.put(
        `http://localhost:3001/emprestimos/extender/${emprestimoId}`,
        {},
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedEmprestimos = emprestimos.map((emprestimo) =>
        emprestimo._id === emprestimoId
          ? { ...emprestimo, ...response.data.emprestimo }
          : emprestimo
      );
      setEmprestimos(updatedEmprestimos);
      alert("Prazo de devolução estendido com sucesso!");
    } catch (error) {
      console.error(error.message || error);
      alert("Erro ao estender prazo de devolução. Tente novamente.");
    }
  };

  useEffect(() => {
    const fetchEmprestimos = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("Token de autenticação não encontrado.");
        }

        const response = await axios.get(
          "http://localhost:3001/emprestimos/historico-do-usuario",
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        );

        const emprestimosComCapas = await Promise.all(
          response.data.map(async (emprestimo) => {
            const capa = emprestimo.livro?.titulo
              ? await fetchBookCover(emprestimo.livro.titulo)
              : null;
            return { ...emprestimo, livro: { ...emprestimo.livro, capa } };
          })
        );

        setEmprestimos(emprestimosComCapas);
      } catch (err) {
        console.error(err.message || err);
        setError("Erro ao carregar os empréstimos. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmprestimos();
  }, []);

  const podeEstenderPrazo = (dataEmprestimo, dataDevolucao) => {
    const dataEmprestimoDate = new Date(dataEmprestimo);
    const dataLimiteExtensao = new Date(
      dataEmprestimoDate.getTime() + 30 * 24 * 60 * 60 * 1000
    );
    const dataAtual = new Date();

    return (
      dataAtual <= dataLimiteExtensao && dataAtual <= new Date(dataDevolucao)
    );
  };

  return (
    <div>
      <NavBar />

      <Container sx={{ py: 4 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Histórico de Empréstimos
        </Typography>
        {error && (
          <Typography color="error" align="center" sx={{ mb: 4 }}>
            {error}
          </Typography>
        )}
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="60vh"
          >
            <CircularProgress />
          </Box>
        ) : emprestimos.length > 0 ? (
          <Grid2 container spacing={4}>
            {emprestimos.map((emprestimo) => {
              const mensagem = getMensagemDevolucao(emprestimo.dataDevolucao);
              const podeEstender = podeEstenderPrazo(
                emprestimo.dataEmprestimo,
                emprestimo.dataDevolucao
              );

              return (
                <Grid2 item key={emprestimo._id} xs={12} sm={6} md={4} lg={3}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {emprestimo.livro?.capa ? (
                      <CardMedia
                        component="img"
                        sx={{
                          width: 128,
                          height: 190,
                          objectFit: "cover",
                          alignSelf: "center",
                        }}
                        image={emprestimo.livro.capa}
                        alt={emprestimo.livro.titulo}
                      />
                    ) : (
                      <Box
                        height="180px"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        bgcolor="grey.300"
                      >
                        <Typography variant="body2" color="text.secondary">
                          Capa indisponível
                        </Typography>
                      </Box>
                    )}
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {emprestimo.livro?.titulo || "Título Desconhecido"}
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary">
                        Status:{" "}
                        {emprestimo.status === "emprestado"
                          ? "Empréstimo Ativo"
                          : "Devolvido"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Data de Empréstimo:{" "}
                        {emprestimo.dataEmprestimo
                          ? new Date(
                              emprestimo.dataEmprestimo
                            ).toLocaleDateString()
                          : "-"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Data de Devolução:{" "}
                        {emprestimo.dataDevolucao
                          ? new Date(
                              emprestimo.dataDevolucao
                            ).toLocaleDateString()
                          : "-"}
                      </Typography>
                      {mensagem && (
                        <Typography variant="body2" color="error">
                          {mensagem}
                        </Typography>
                      )}
                      {emprestimo.status === "emprestado" &&
                        podeEstender &&
                        !emprestimo.extendido && (
                          <Button
                            variant="contained"
                            color="primary"
                            sx={{ mt: 2 }}
                            onClick={() => handleExtendLoan(emprestimo._id)}
                          >
                            Extender por mais 15 dias
                          </Button>
                        )}
                    </CardContent>
                  </Card>
                </Grid2>
              );
            })}
          </Grid2>
        ) : (
          <Typography align="center">Nenhum empréstimo encontrado.</Typography>
        )}
      </Container>
    </div>
  );
};

export default HistoricoEmprestimos;
