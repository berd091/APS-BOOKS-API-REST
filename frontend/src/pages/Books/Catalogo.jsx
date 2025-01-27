import React, { useEffect, useState } from "react";

import axios from "axios";
import {
  Container,
  Grid2,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  CircularProgress,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Link } from "react-router-dom";
import NavBar from "../../components/navBar/navBar";

const Catalogo = () => {
  const [livros, setLivros] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [disponibilidadeFiltro, setDisponibilidadeFiltro] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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

        const categoriasUnicas = [
          ...new Set(livrosComImagens.map((livro) => livro.categoria)),
        ];
        setCategorias(categoriasUnicas);
      } catch (err) {
        setError("Erro ao carregar os livros. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchLivros();
  }, []);

  const filtrarLivros = () => {
    return livros.filter((livro) => {
      const filtroCategoria = categoriaFiltro
        ? livro.categoria === categoriaFiltro
        : true;
      const filtroDisponibilidade = disponibilidadeFiltro
        ? disponibilidadeFiltro === "disponivel"
          ? livro.disponivel
          : !livro.disponivel
        : true;

      return filtroCategoria && filtroDisponibilidade;
    });
  };

  return (
    <div>
      <NavBar />

      <Container sx={{ py: 4 }}>
        {error && (
          <Typography color="error" align="center" sx={{ mb: 4 }}>
            {error}
          </Typography>
        )}

        <Box
          sx={{
            mb: 4,
            display: "flex",
            gap: 2,
            justifyContent: "center",
            backgroundColor: "white",
          }}
        >
          <FormControl variant="outlined" sx={{ minWidth: 200 }}>
            <InputLabel sx={{}}>Categoria</InputLabel>
            <Select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              label="Categoria"
            >
              <MenuItem value="">Todas</MenuItem>
              {categorias.map((categoria) => (
                <MenuItem key={categoria} value={categoria}>
                  {categoria}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl variant="outlined" sx={{ minWidth: 200 }}>
            <InputLabel>Disponibilidade</InputLabel>
            <Select
              value={disponibilidadeFiltro}
              onChange={(e) => setDisponibilidadeFiltro(e.target.value)}
              label="Disponibilidade"
            >
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="disponivel">Disponível</MenuItem>
              <MenuItem value="indisponivel">Indisponível</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="60vh"
          >
            <CircularProgress />
          </Box>
        ) : filtrarLivros().length > 0 ? (
          <Grid2 container spacing={4}>
            {filtrarLivros().map((livro) => (
              <Grid2 item key={livro.livroId} xs={12} sm={6} md={4} lg={3}>
                <Card
                  sx={{
                    height: 450,
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
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      {livro.sinopse
                        ? `${livro.sinopse.slice(0, 40)}...`
                        : "Sinopse não disponível."}
                    </Typography>
                  </CardContent>
                  <CardActions
                    sx={{ mt: "auto", justifyContent: "space-between" }}
                  >
                    <Button
                      size="small"
                      color="primary"
                      component={Link}
                      sx={{ cursor: "pointer" }}
                      to={`/livros/${livro.livroId}`}
                    >
                      Ver Detalhes
                    </Button>
                    <Typography
                      variant="caption"
                      color={livro.disponivel ? "green" : "red"}
                    >
                      {livro.disponivel ? "Disponível" : "Indisponível"}
                    </Typography>
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

export default Catalogo;
