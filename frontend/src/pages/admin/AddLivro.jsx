import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  CircularProgress,
  Alert,
  Grid,
  Autocomplete,
  Avatar,
  InputAdornment,
  Paper,
  Fade,
  LinearProgress,
} from "@mui/material";
import {
  AddCircleOutline,
  AutoStories,
  Search,
  Cancel,
  CheckCircle,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import NavBar from "../../components/navBar/navBar";
import { categories } from "../../components/books/bookCategories";

const AddLivro = () => {
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [ano, setAno] = useState("");
  const [sinopse, setSinopse] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [sugestoes, setSugestoes] = useState([]);
  const navigate = useNavigate();
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [permissionLoading, setPermissionLoading] = useState(true);

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
          navigate("/");
        }
      } catch (error) {
        console.error("Erro ao verificar permissões:", error);
        navigate("/");
      } finally {
        setPermissionLoading(false);
      }
    };

    verificarPermissao();
  }, [navigate]);

  const buscarSugestoes = async () => {
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(
      setTimeout(async () => {
        if (!titulo && !autor) {
          setSugestoes([]);
          return;
        }

        setLoading(true);
        try {
          const query = `${titulo ? `intitle:${titulo}` : ""}${
            autor ? `+inauthor:${autor}` : ""
          }`;
          const response = await axios.get(
            `https://www.googleapis.com/books/v1/volumes?q=${query}&langRestrict=pt`
          );
          const livros = response.data.items || [];
          setSugestoes(
            livros.map((livro) => ({
              titulo: livro.volumeInfo.title,
              autor: livro.volumeInfo.authors?.[0] || "",
              ano: livro.volumeInfo.publishedDate?.split("-")[0] || "",
              categoria: livro.volumeInfo.categories?.[0] || "",
              sinopse: livro.volumeInfo.description || "",
            }))
          );
        } catch (error) {
          console.error("Erro ao buscar sugestões:", error);
        } finally {
          setLoading(false);
        }
      }, 500)
    );
  };

  const preencherCampos = (sugestao) => {
    setTitulo(sugestao.titulo);
    setAutor(sugestao.autor);
    setAno(sugestao.ano);
    setCategoria(sugestao.categoria);
    setSinopse(sugestao.sinopse);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");

    try {
      const token = localStorage.getItem("authToken");

      const novoLivro = {
        titulo,
        autor,
        categoria,
        ano: parseInt(ano, 10),
        sinopse,
      };

      await axios.post("http://localhost:3001/livros", novoLivro, {
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setMensagem("Livro adicionado com sucesso!");
      setTitulo("");
      setAutor("");
      setCategoria("");
      setAno("");
      setSinopse("");
    } catch (error) {
      console.error("Erro ao adicionar livro:", error);
      setMensagem("Erro ao adicionar o livro. Tente novamente.");
    }
  };

  if (permissionLoading) {
    return (
      <Box sx={{ width: "100%" }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <div>
      <NavBar />
      <Container maxWidth="sm" sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
          <Box
            sx={{
              textAlign: "center",
              mb: 4,
              backgroundColor: "background.paper",
            }}
          >
            <Avatar sx={{ bgcolor: "primary.main", mx: "auto", mb: 2 }}>
              <AutoStories fontSize="large" />
            </Avatar>
            <Typography variant="h4" component="h1" gutterBottom>
              Cadastrar Novo Livro
            </Typography>
            <Typography color="textSecondary">
              Preencha os campos abaixo ou utilize a busca automática
            </Typography>
          </Box>
          {mensagem && (
            <Fade in={!!mensagem}>
              <Alert
                severity={mensagem.includes("sucesso") ? "success" : "error"}
                sx={{ mb: 3 }}
                onClose={() => setMensagem("")}
                icon={
                  mensagem.includes("sucesso") ? (
                    <CheckCircle fontSize="inherit" />
                  ) : (
                    <Cancel fontSize="inherit" />
                  )
                }
              >
                {mensagem}
              </Alert>
            </Fade>
          )}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Buscar livro"
                  variant="outlined"
                  value={titulo}
                  onChange={(e) => {
                    setTitulo(e.target.value);
                    buscarSugestoes();
                  }}
                  onFocus={() => setSugestoes([])} 
                  onBlur={() => setTimeout(() => setSugestoes([]), 200)} 
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Comece a digitar o título para buscar sugestões"
                />
                {loading && (
                  <CircularProgress
                    size={24}
                    sx={{ position: "absolute", mt: 1, ml: 2 }}
                  />
                )}
              </Grid>
              {sugestoes.length > 0 && (
                <Grid item xs={12}>
                  <Paper
                    elevation={2}
                    sx={{ maxHeight: 300, overflow: "auto", p: 1 }}
                  >
                    {sugestoes.map((sugestao, index) => (
                      <MenuItem
                        key={index}
                        onClick={() => preencherCampos(sugestao)}
                        sx={{
                          "&:hover": { bgcolor: "action.hover" },
                          borderRadius: 1,
                          border: 1,
                          borderColor: "white",
                          backgroundColor: "#EEEEEE",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          
                          <Box>
                            <Typography variant="subtitle1">
                              {sugestao.titulo}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {sugestao.autor} - {sugestao.ano}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Paper>
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Título"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Autor"
                  value={autor}
                  onChange={(e) => setAutor(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  fullWidth
                  options={categories}
                  getOptionLabel={(option) => option.label}
                  value={
                    categories.find((cat) => cat.value === categoria) || null
                  }
                  onChange={(event, newValue) =>
                    setCategoria(newValue?.value || "")
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Categoria" required />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Ano de Publicação"
                  type="number"
                  value={ano}
                  onChange={(e) => setAno(e.target.value)}
                  inputProps={{ max: new Date().getFullYear() }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Sinopse"
                  multiline
                  rows={4}
                  value={sinopse}
                  onChange={(e) => setSinopse(e.target.value)}
                  inputProps={{ maxLength: 1000 }}
                  helperText={`${sinopse.length}/1000 caracteres`}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<AddCircleOutline />}
                  sx={{ py: 1.5 }}
                >
                  Cadastrar Livro
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </div>
  );
};

export default AddLivro;
