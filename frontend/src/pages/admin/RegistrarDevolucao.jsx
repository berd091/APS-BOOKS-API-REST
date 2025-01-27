import React, { useState, useEffect } from "react";
import axios from "axios";
import { TextField, Button, Card, CardContent, Typography, Grid2, Snackbar } from "@mui/material";
import NavBar from "../../components/navBar/navBar";
import { useNavigate } from "react-router-dom";

const RegistrarDevolucao = () => {
  const [email, setEmail] = useState("");
  const [emprestimos, setEmprestimos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
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
          alert(
            "Acesso restrito! Apenas bibliotecários podem acessar esta página."
          );
          navigate("/");
        }
      } catch (error) {
        console.error("Erro ao verificar permissões:", error);
        navigate("/");
      }
    };

    verificarPermissao();
  }, [navigate]);


  const buscarEmprestimos = async () => {
    setLoading(true);
    setEmprestimos([]);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`http://localhost:3001/emprestimos?email=${email}`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      setEmprestimos(response.data);
    } catch (error) {
      setErrorMessage("Erro ao buscar empréstimos. Verifique o e-mail ou tente novamente.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const registrarDevolucao = async (emprestimoId) => {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        `http://localhost:3001/emprestimos/return/${emprestimoId}`,
        {},
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage("Livro devolvido com sucesso!");
      buscarEmprestimos(); 
    } catch (error) {
      setErrorMessage("Erro ao registrar devolução. Tente novamente.");
      console.error(error);
    }
  };

  return (
    <>
      <NavBar />
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <Typography variant="h4" gutterBottom textAlign="center">
          Registro de Devolução
        </Typography>
        <Card style={{ marginBottom: "20px", padding: "20px" }}>
          <Typography variant="h6" gutterBottom>
            Buscar Empréstimos por E-mail
          </Typography>
          <Grid2 container spacing={2} alignItems="center">
            <Grid2 item xs={9}>
              <TextField
                fullWidth
                label="E-mail do Usuário"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="outlined"
              />
            </Grid2>
            <Grid2 item xs={3}>
              <Button
                variant="contained"
                color="primary"
                onClick={buscarEmprestimos}
                disabled={loading || !email}
              >
                {loading ? "Buscando..." : "Buscar"}
              </Button>
            </Grid2>
          </Grid2>
        </Card>

        {emprestimos.length > 0 && (
          <div>
            <Typography variant="h5" gutterBottom>
              Empréstimos Encontrados
            </Typography>
            {emprestimos.map((emprestimo) => (
              <Card key={emprestimo._id} style={{ marginBottom: "15px" }}>
                <CardContent>
                  <Typography variant="subtitle1">
                    <strong>Livro:</strong> {emprestimo.livro.titulo}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Data do Empréstimo:</strong> {new Date(emprestimo.dataEmprestimo).toLocaleDateString()}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Prazo de Devolução:</strong> {new Date(emprestimo.dataDevolucao).toLocaleDateString()}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Status:</strong> {emprestimo.status}
                  </Typography>
                  {emprestimo.status !== "devolvido" && (
                    <Button
                      variant="contained"
                      color="success"
                      style={{ marginTop: "10px" }}
                      onClick={() => registrarDevolucao(emprestimo._id)}
                    >
                      Registrar Devolução
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {errorMessage && (
          <Snackbar
            open={Boolean(errorMessage)}
            onClose={() => setErrorMessage("")}
            message={errorMessage}
            autoHideDuration={6000}
          />
        )}
        {successMessage && (
          <Snackbar
            open={Boolean(successMessage)}
            onClose={() => setSuccessMessage("")}
            message={successMessage}
            autoHideDuration={6000}
          />
        )}

        {!loading && emprestimos.length === 0 && email && (
          <Typography variant="subtitle1" style={{ marginTop: "20px" }}>
            Nenhum empréstimo encontrado para este e-mail.
          </Typography>
        )}
      </div>
    </>
  );
};

export default RegistrarDevolucao;
