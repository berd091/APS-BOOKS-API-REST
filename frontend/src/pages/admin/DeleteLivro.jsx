import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  CircularProgress,
  Box,
  Typography,
  Grid2,
  Card,
  CardContent,
  CardActions,
  Button,
  CardMedia,
} from "@mui/material";
import { MdRemoveCircle } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/navBar/navBar";

const DeleteLivro = () => {
  const [livros, setLivros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const verificarPermissao = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get("http://localhost:3001/auth/role", {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });

        if (response.data.role !== "admin") {
          alert(
            "Acesso restrito! Apenas bibliotecários podem acessar esta página."
          );
          navigate("/catalogo");
        }
      } catch (error) {
        console.error("Erro ao verificar permissões:", error);
        navigate("/");
      }
    };

    const fetchLivros = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get("http://localhost:3001/livros", {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });

        const livrosComImagens = await Promise.all(
          response.data.map(async (livro) => {
            try {
              const googleResponse = await axios.get(
                `https://www.googleapis.com/books/v1/volumes?q=intitle:${livro.titulo}`
              );

              const image =
                googleResponse.data.items?.[0]?.volumeInfo?.imageLinks
                  ?.thumbnail || "";
              return { ...livro, image };
            } catch {
              return { ...livro, image: "" };
            }
          })
        );

        setLivros(livrosComImagens);
      } catch (error) {
        console.error("Erro ao buscar livros:", error);
        setMensagem("Erro ao carregar os livros. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    verificarPermissao();
    fetchLivros();
  }, [navigate]);

  const handleDelete = async (livroId) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`http://localhost:3001/livros/${livroId}`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      setLivros((prev) => prev.filter((livro) => livro.livroId !== livroId));
      setMensagem("Livro removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover livro:", error);
      setMensagem("Erro ao remover o livro. Tente novamente.");
    }
  };


  return (
    <div>
      <NavBar />
      <Container sx={{ py: 4 }}>
        <Typography variant="h3" align="center" gutterBottom>
          <MdRemoveCircle style={{ color: "red", marginRight: "10px" }} />
          Remover Livro
        </Typography>
        {mensagem && (
          <Typography
            color={mensagem.includes("sucesso") ? "green" : "red"}
            variant="body2"
            sx={{ mt: 2, mb: 4, textAlign: "center" }}
          >
            {mensagem}
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
        ) : livros.length > 0 ? (
          <Grid2 container spacing={4}>
            {livros.map((livro) => (
              <Grid2 item key={livro.livroId} xs={12} sm={6} md={4} lg={3}>
                <Card
                  sx={{
                    height: 400,
                    width: 250,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardMedia
                    component="img"
                    image={livro.image || "/placeholder.png"}
                    alt={livro.titulo}
                    sx={{
                      width: 128,
                      height: 190,
                      objectFit: "cover",
                      alignSelf: "center",
                    }}
                  />
                  <CardContent>
                    <Typography variant="h7" gutterBottom>
                      {livro.titulo}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      {livro.autor}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      {livro.categoria}
                    </Typography>
                  </CardContent>
                  <CardActions
                    sx={{ mt: "auto", justifyContent: "space-between" }}
                  >
                    <Button
                      size="small"
                      color="error"
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleDelete(livro.livroId)} 
                    >
                      Remover
                    </Button>

                  </CardActions>
                </Card>
              </Grid2>
            ))}
          </Grid2>
        ) : (
          <Typography align="center">Nenhum livro encontrado.</Typography>
        )}
      </Container>
    </div>
  );
};

export default DeleteLivro;
