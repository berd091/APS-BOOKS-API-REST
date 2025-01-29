import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  Grid,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Event,
  Category,
  Person,
  ArrowBack,
  // Bookmark,
  // BookmarkBorder,
} from "@mui/icons-material";
import { BsBookHalf } from "react-icons/bs";
import { MdOutlinePendingActions } from "react-icons/md";
import { motion } from "framer-motion";
import NavBar from "../../components/navBar/navBar";

const DetalhesLivro = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [livro, setLivro] = useState(null);
  const [error, setError] = useState("");
  const [imagemCapa, setImagemCapa] = useState("");
  // const [isFavorito, setIsFavorito] = useState(false); // Estado para favoritos

  useEffect(() => {
    const fetchLivro = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(`http://localhost:3001/livros/${id}`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });

        const livroData = response.data;

        const googleResponse = await axios.get(
          `https://www.googleapis.com/books/v1/volumes?q=intitle:${livroData.titulo}`
        );

        const image =
          googleResponse.data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail ||
          "";

        setLivro(livroData);
        setImagemCapa(image);
      } catch (err) {
        setError("Erro ao carregar os detalhes do livro.");
      }
    };

    fetchLivro();
  }, [id]);

  // const handleFavorito = () => {
  //   setIsFavorito(!isFavorito); 
  // };

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
      <Container sx={{ py: 4,  }}>
        <Card
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          sx={{
            maxWidth: 800,
            mx: "auto",
            p: 3,
            boxShadow: 4,
            borderRadius: 2,
            backgroundColor: "#f5f5f5",
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 3, backgroundColor: "#f5f5f5" }}
          >
            <IconButton onClick={() => navigate(-1)}>
              <ArrowBack />
            </IconButton>
            <Box display="flex" alignItems="center" gap={2} sx={{ backgroundColor: "#f5f5f5"}}>
              <BsBookHalf size={40} color="#3f51b5" />
              <Typography variant="h4" color="primary">
                {livro.titulo}
              </Typography>
            </Box>
            {/* <Tooltip title={isFavorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
              <IconButton onClick={handleFavorito}>
                {isFavorito ? <Bookmark color="primary" /> : <BookmarkBorder color="primary" />}
              </IconButton> 
            </Tooltip> */}
            <Tooltip>
              
            </Tooltip>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mb: 3,
                  backgroundColor: "#f5f5f5",
                  p: 2,
                  borderRadius: 2,
                }}
              >
                <CardMedia
                  component="img"
                  image={imagemCapa}
                  alt={livro.titulo}
                  sx={{
                    width: "100%",
                    maxWidth: 200,
                    height: "auto",
                    objectFit: "cover",
                    borderRadius: 2,
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <CardContent sx={{backgroundColor: "#f5f5f5"}}>
                <Box display="flex" flexDirection="column" gap={2} sx={{backgroundColor: "#f5f5f5"}}>
                  <Typography
                    variant="h6"
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
                    <Person color="action" />
                    Autor: <strong>{livro.autor}</strong>
                  </Typography>
                  <Typography
                    variant="h6"
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
                    <Category color="action" />
                    Categoria: <strong>{livro.categoria}</strong>
                  </Typography>
                  <Typography
                    variant="h6"
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
                    <Event color="action" />
                    Ano: <strong>{livro.ano}</strong>
                  </Typography>
                  <Typography variant="body1" sx={{ textAlign: "justify" }}>
                    <strong>Sinopse:</strong>{" "}
                    {livro.sinopse || "Sinopse não disponível."}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} sx={{backgroundColor: "#f5f5f5"}}>
                    <MdOutlinePendingActions
                      size={24}
                      color={livro.disponivel ? "green" : "red"}
                    />
                    <Chip
                      label={livro.disponivel ? "Disponível" : "Indisponível"}
                      color={livro.disponivel ? "success" : "error"}
                      variant="outlined"
                      sx={{ fontSize: "0.9rem" }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="flex-end" mt={1} sx={{backgroundColor: "#f5f5f5"}}>
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
    </div>
  );
};

export default DetalhesLivro;