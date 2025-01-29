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
  Skeleton,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  IconButton
} from "@mui/material";
import { Link } from "react-router-dom";
import NavBar from "../../components/navBar/navBar";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import { Search, Close } from "@mui/icons-material";

const SkeletonContainer = styled(Box)({
  display: "flex",
  flexWrap: "wrap",
  gap: "16px",
  justifyContent: "center",
});

const StyledCard = styled(motion(Card))(({ theme }) => ({
  height: "100%",
  width: "100%",
  maxWidth: "350px",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[6],
  },
}));

const SearchContainer = styled(Box)({
  position: "relative",
  margin: "20px 0",
  width: "100%",
  maxWidth: "600px",
});

const Catalogo = () => {
  const [livros, setLivros] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [disponibilidadeFiltro, setDisponibilidadeFiltro] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

							const image = googleResponse.data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail || "";
							return { ...livro, image };
						} catch {
							return { ...livro, image: "" };
						}
					})
				);

				setLivros(livrosComImagens);

				const categoriasUnicas = [...new Set(livrosComImagens.map((livro) => livro.categoria))];
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
      const matchesSearch =
        livro.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        livro.autor.toLowerCase().includes(searchTerm.toLowerCase());
      const filtroCategoria = categoriaFiltro
        ? livro.categoria === categoriaFiltro
        : true;
      const filtroDisponibilidade = disponibilidadeFiltro
        ? disponibilidadeFiltro === "disponivel"
          ? livro.disponivel
          : !livro.disponivel
        : true;

      return matchesSearch && filtroCategoria && filtroDisponibilidade;
    });
  };

	return (
		<div>
			<NavBar />

      <Container
        sx={{
          py: 4,
          "@media (max-width: 600px)": {
            px: 2,
          },
        }}
      >
        {error && (
          <Typography color="error" align="center" sx={{ mb: 4 }}>
            {error}
          </Typography>
        )}
        <SearchContainer sx={{ mx: "auto" }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar por título ou autor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ color: "action.active", mr: 1 }} />,
              endAdornment: searchTerm && (
                <IconButton onClick={() => setSearchTerm("")}>
                  <Close fontSize="small" />
                </IconButton>
              ),
            }}
          />
        </SearchContainer>

        <Box
          sx={{
            mb: 4,
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            justifyContent: "center",
            backgroundColor: "background.paper",
            p: 3,
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <FormControl variant="outlined" sx={{ minWidth: 200, flex: 1 }}>
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

          <FormControl variant="outlined" sx={{ minWidth: 200, flex: 1 }}>
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
          <SkeletonContainer>
            {Array.from(new Array(8)).map((_, index) => (
              <Grid2 item key={index} xs={12} sm={6} md={4} lg={3}>
                <Card sx={{ height: 450, width: 250 }}>
                  <Skeleton
                    variant="rectangular"
                    height={190}
                    sx={{ bgcolor: "grey.300" }}
                  />
                  <CardContent>
                    <Skeleton
                      variant="text"
                      width="60%"
                      height={30}
                      sx={{ bgcolor: "grey.300", mb: 1 }}
                    />
                    <Skeleton
                      variant="text"
                      width="40%"
                      height={20}
                      sx={{ bgcolor: "grey.300", mb: 1 }}
                    />
                    <Skeleton
                      variant="text"
                      width="30%"
                      height={20}
                      sx={{ bgcolor: "grey.300", mb: 2 }}
                    />
                    <Skeleton
                      variant="text"
                      width="100%"
                      height={50}
                      sx={{ bgcolor: "grey.300" }}
                    />
                  </CardContent>
                  <CardActions sx={{ justifyContent: "space-between", p: 2 }}>
                    <Skeleton
                      variant="rectangular"
                      width={100}
                      height={36}
                      sx={{ bgcolor: "grey.300" }}
                    />
                    <Skeleton
                      variant="rectangular"
                      width={100}
                      height={24}
                      sx={{ bgcolor: "grey.300" }}
                    />
                  </CardActions>
                </Card>
              </Grid2>
            ))}
          </SkeletonContainer>
        ) : filtrarLivros().length > 0 ? (
          <Grid2 container spacing={4}>
            {filtrarLivros().map((livro) => (
              <Grid2
                item
                key={livro.livroId}
                xs={12}
                sm={6}
                md={4}
                lg={3}
                sx={{
                  "@media (max-width: 600px)": {
                    display: "flex",
                    justifyContent: "center",
                  },
                }}
              >
                <StyledCard
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <CardMedia
                    component="img"
                    image={livro.image || "/placeholder.png"}
                    alt={livro.titulo}
                    sx={{
                      height: 250,
                      objectFit: "contain",
                      p: 2,
                      backgroundColor: "#f5f5f5",
                    }}
                    onError={(e) => {
                      e.target.src = "/placeholder.png";
                    }}
                  />

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        fontWeight: 600,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {livro.titulo}
                    </Typography>

                    <Chip
                      label={livro.categoria}
                      size="small"
                      sx={{ mb: 1, bgcolor: "primary.light", color: "white" }}
                    />

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {livro.sinopse || "Sinopse não disponível."}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ justifyContent: "space-between", p: 2 }}>
                    <Button
                      variant="contained"
                      size="small"
                      component={Link}
                      to={`/livros/${livro.livroId}`}
                      sx={{ textTransform: "none" }}
                    >
                      Detalhes
                    </Button>
                    <Chip
                      label={livro.disponivel ? "Disponível" : "Indisponível"}
                      size="small"
                      color={livro.disponivel ? "success" : "error"}
                      variant="outlined"
                    />
                  </CardActions>
                </StyledCard>
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
