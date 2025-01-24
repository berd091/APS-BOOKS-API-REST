import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Container,
  CardMedia,
} from "@mui/material";
import { LibraryBooks, Event, Category, Person } from "@mui/icons-material";
import { BsBookHalf } from "react-icons/bs";
import { MdOutlinePendingActions } from "react-icons/md";

const DetalhesLivro = () => {
  const { id } = useParams();
  const [livro, setLivro] = useState(null);
  const [error, setError] = useState("");
  const [imagemCapa, setImagemCapa] = useState(""); // Estado para armazenar a imagem da capa

  useEffect(() => {
    const fetchLivro = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(`http://localhost:3001/livros/${id}`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });

        // Pega os dados do livro
        const livroData = response.data;

        // Buscar a capa do livro usando o Google Books API
        const googleResponse = await axios.get(
          `https://www.googleapis.com/books/v1/volumes?q=intitle:${livroData.titulo}`
        );

        const image =
          googleResponse.data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail || "";

        // Atualiza o estado com os dados do livro e a imagem da capa
        setLivro(livroData);
        setImagemCapa(image);
      } catch (err) {
        setError("Erro ao carregar os detalhes do livro.");
      }
    };

    fetchLivro();
  }, [id]);

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

        {imagemCapa && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 3,
              backgroundColor: "#EEEEEE"

            }}
          >
            <CardMedia
              component="img"
              image={imagemCapa}
              alt={livro.titulo}
              sx={{
                width: 150,
                height: 225,
                objectFit: "cover",
              }}
            />
          </Box>
        )}

        <CardContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="h6" display="flex" alignItems="center" gap={1}>
              <Person color="action" />
              Autor: <strong>{livro.autor}</strong>
            </Typography>
            <Typography variant="h6" display="flex" alignItems="center" gap={1}>
              <Category color="action" />
              Categoria: <strong>{livro.categoria}</strong>
            </Typography>
            <Typography variant="h6" display="flex" alignItems="center" gap={1}>
              <Event color="action" />
              Ano: <strong>{livro.ano}</strong>
            </Typography>
            <Typography variant="body1" sx={{ textAlign: "justify" }}>
              <strong>Sinopse:</strong> {livro.sinopse || "Sinopse não disponível."}
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <MdOutlinePendingActions size={24} color={livro.disponivel ? "green" : "red"} />
              <Chip
                label={livro.disponivel ? "Disponível" : "Indisponível"}
                color={livro.disponivel ? "success" : "error"}
                variant="outlined"
                sx={{ fontSize: "0.9rem" }}
              />
            </Box>
          </Box>
        </CardContent>
        <Box display="flex" justifyContent="flex-end" mt={3}>
          {livro.disponivel && (
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={Link}
              to={`/emprestimo/${livro.livroId}`}
              sx={{ textTransform: "none" }}
            >
              Reservar Livro
            </Button>
          )}
        </Box>
      </Card>
    </Container>
  );
};

export default DetalhesLivro;
