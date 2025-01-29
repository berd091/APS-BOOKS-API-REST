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
import { MdAddCircle } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/navBar/navBar";

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
      }
    };

    verificarPermissao();
  }, [navigate]);

  const buscarSugestoes = async () => {
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
            <MdAddCircle style={{ color: "blue", marginRight: "10px" }} />
            Adicionar Novo Livro
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
                buscarSugestoes();
              }}
              fullWidth
              margin="normal"
              required
            />
            {loading && <CircularProgress size={24} sx={{ mt: 1, mb: 2 }} />}
            {sugestoes.length > 0 && (
              <Box sx={{ mt: 1, mb: 2, maxHeight: "300px", overflowY: "auto" }}>
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
              onChange={(e) => {
                setAutor(e.target.value);
                buscarSugestoes();
              }}
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
            <TextField
              label="Sinopse"
              value={sinopse}
              onChange={(e) => setSinopse(e.target.value)}
              multiline
              rows={4}
              fullWidth
              margin="normal"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3 }}
            >
              Adicionar Livro
            </Button>
          </form>
        </Box>
      </Container>
    </div>
  );
};

export default AddLivro;
