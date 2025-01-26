// só o bibliotecario pode ver essa pagina
// só o bibliotecario pode ver essa pagina
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
} from "@mui/material";
import { MdRemoveCircle } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/navBar/navBar";
const DeleteLivro = () => {
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [ano, setAno] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [sugestoes, setSugestoes] = useState([]);
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

  const buscarSugestoes = async (titulo) => {
    if (!titulo) {
      setSugestoes([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${titulo}`
      );
      const livros = response.data.items?.slice(0, 5) || [];
      setSugestoes(
        livros.map((livro) => ({
          titulo: livro.volumeInfo.title,
          autor: livro.volumeInfo.authors?.[0] || "",
          ano: livro.volumeInfo.publishedDate?.split("-")[0] || "",
          categoria: livro.volumeInfo.categories?.[0] || "",
        }))
      );
    } catch (error) {
      console.error("Erro ao buscar sugestões:", error);
    } finally {
      setLoading(false);
    }
  };

  const preencherCampos = (sugestao) => {
    setTitulo(sugestao.titulo);
    setAutor(sugestao.autor);
    setAno(sugestao.ano);
    setCategoria(sugestao.categoria);
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
      };
      // aqui botar pra remover o livro pelo id, buscando o id do livro pelas informacoes preenchidas na pagina
      await axios.delete(
        `http://localhost:3001/livros/${novoLivro._id}`,
        novoLivro,
        {
          headers: {
            authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMensagem("Livro removido com sucesso!");
      setTitulo("");
      setAutor("");
      setCategoria("");
      setAno("");
    } catch (error) {
      console.error("Erro ao remover livro:", error);
      setMensagem("Erro ao remover o livro. Tente novamente.");
    }
  };

  return (
    <div>
      <NavBar />
      <Container maxWidth="sm">
        <Box
          sx={{
            mt: 4,
            p: 4,
            borderRadius: 2,
            boxShadow: 3,
            backgroundColor: "#f5f5f5",
          }}
        >
          <Typography variant="h4" align="center" gutterBottom>
            <MdRemoveCircle style={{ color: "red", marginRight: "10px" }} />
            Remover Livro
          </Typography>
          {mensagem && (
            <Typography
              color={mensagem.includes("sucesso") ? "green" : "red"}
              variant="body2"
              sx={{ mt: 1 }}
            >
              {mensagem}
            </Typography>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              label="Título"
              value={titulo}
              onChange={(e) => {
                setTitulo(e.target.value);
                buscarSugestoes(e.target.value);
              }}
              fullWidth
              margin="normal"
              required
            />
            {loading && <CircularProgress size={24} sx={{ mt: 1, mb: 2 }} />}
            {sugestoes.length > 0 && (
              <Box sx={{ mt: 1, mb: 2 }}>
                {sugestoes.map((sugestao, index) => (
                  <MenuItem
                    key={index}
                    onClick={() => preencherCampos(sugestao)}
                    style={{ cursor: "pointer" }}
                  >
                    {sugestao.titulo} - {sugestao.autor}
                  </MenuItem>
                ))}
              </Box>
            )}
            <TextField
              label="Autor"
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Ano"
              type="number"
              value={ano}
              onChange={(e) => setAno(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="error"
              fullWidth
              sx={{ mt: 3 }}
            >
              Remover Livro
            </Button>
          </form>
        </Box>
      </Container>
    </div>
  );
};

export default DeleteLivro;
