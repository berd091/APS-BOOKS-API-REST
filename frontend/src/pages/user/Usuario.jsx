import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";
import NavBar from "../../components/navBar/navBar";
const HistoricoEmprestimos = () => {
  const [emprestimos, setEmprestimos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEmprestimos = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          "http://localhost:3001/emprestimos/historico-do-usuario",
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        );
        setEmprestimos(response.data);
      } catch (err) {
        setError("Erro ao carregar os empréstimos. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmprestimos();
  }, []);

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
          <Grid container spacing={4}>
            {emprestimos.map((emprestimo) => (
              <Grid item key={emprestimo._id} xs={12} sm={6} md={4} lg={3}>
                <Card
                  sx={{ height: 250, display: "flex", flexDirection: "column" }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {emprestimo.livroId?.titulo || "Título Desconhecido"}
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
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography align="center">Nenhum empréstimo encontrado.</Typography>
        )}
      </Container>
    </div>
  );
};

export default HistoricoEmprestimos;
