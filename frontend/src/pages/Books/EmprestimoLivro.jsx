import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  Grid,
  Divider,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Skeleton,
} from "@mui/material";
import {
  BsBookHalf,
  BsCalendarCheck,
  BsGeoAlt,
  BsPerson,
  BsClockHistory,
} from "react-icons/bs";
import { motion } from "framer-motion";
import NavBar from "../../components/navBar/navBar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const EmprestimoLivro = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [livro, setLivro] = useState(null);
  const [error, setError] = useState("");
  const [dataDevolucao, setDataDevolucao] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [imagemCapa, setImagemCapa] = useState("");

  const calcularDataDevolucao = () => {
    const hoje = new Date();
    const devolucao = new Date(hoje);
    devolucao.setDate(hoje.getDate() + 15);
    return devolucao;
  };

  useEffect(() => {
    const fetchLivro = async () => {
      try {
        const token = localStorage.getItem("authToken");
        console.log(token);
        const response = await axios.get(`http://localhost:3001/livros/${id}`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });
        const googleResponse = await axios.get(
          `https://www.googleapis.com/books/v1/volumes?q=intitle:${response.data.titulo}`
        );
        const image =
          googleResponse.data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail ||
          "";

        setLivro(response.data);
        setImagemCapa(image);
        setDataDevolucao(calcularDataDevolucao());
      } catch (err) {
        setError("Erro ao carregar os detalhes do livro.");
      }
    };

    fetchLivro();
  }, [id]);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const solicitarEmprestimo = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        `http://localhost:3001/reservas/${livro.livroId}`,
        {},
        { headers: { authorization: `Bearer ${token}` } }
      );
      navigate("/usuario", {
        state: { success: "Empréstimo solicitado com sucesso!" },
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Erro ao solicitar o empréstimo."
      );
    } finally {
      handleCloseDialog();
    }
  };

  if (error) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <BsBookHalf size={64} color="#ff4444" style={{ marginBottom: 16 }} />
        <Typography variant="h5" color="error" gutterBottom>
          Ocorreu um erro!
        </Typography>
        <Typography color="textSecondary">{error}</Typography>
        <Button variant="outlined" sx={{ mt: 3 }} onClick={() => navigate(-1)}>
          Voltar
        </Button>
      </Container>
    );
  }

  if (!livro) {
    return (
      <Container sx={{ py: 4 }}>
        <Skeleton
          variant="rectangular"
          width="100%"
          height={400}
          sx={{ borderRadius: 2 }}
        />
      </Container>
    );
  }

  return (
    <div>
      <NavBar />
      <Container sx={{ py: 4 }}>
        <Card
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{
            maxWidth: 800,
            mx: "auto",
            p: 4,
            borderRadius: 3,
            boxShadow: 3,
            background: "linear-gradient(145deg, #ffffff, #f8f9fa)",
          }}
        >
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  position: "relative",
                  height: 300,
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: 3,
                  bgcolor: "#f5f5f5",
                }}
              >
                {imagemCapa ? (
                  <img
                    src={imagemCapa}
                    alt={livro.titulo}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Box
                    display="flex"
                    height="100%"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <BsBookHalf size={64} color="#3f51b5" />
                  </Box>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <CardContent>
                <Typography
                  variant="h3"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    color: "primary.main",
                    mb: 4,
                  }}
                >
                  {livro.titulo}
                </Typography>

                <Box sx={{ mb: 4, backgroundColor: "background.paper" }}>
                  <Chip
                    label="Detalhes do Empréstimo"
                    color="primary"
                    variant="outlined"
                    sx={{ mb: 2, fontWeight: 600 }}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      backgroundColor: "background.paper",
                    }}
                  >
                    <DetailItem
                      icon={<BsPerson size={20} />}
                      title="Autor"
                      value={livro.autor}
                    />
                    <DetailItem
                      icon={<BsCalendarCheck size={20} />}
                      title="Ano de Publicação"
                      value={livro.ano}
                    />
                    <DetailItem
                      icon={<BsGeoAlt size={20} />}
                      title="Local de Coleta"
                      value="CEFEZES - Biblioteca Central"
                    />
                    <DetailItem
                      icon={<BsClockHistory size={20} />}
                      title="Data de Devolução"
                      value={format(dataDevolucao, "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })}
                      valueColor="success.main"
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography
                  variant="body1"
                  sx={{
                    textAlign: "justify",
                    lineHeight: 1.6,
                    color: "text.secondary",
                  }}
                >
                  {livro.sinopse || "Sinopse não disponível."}
                </Typography>
              </CardContent>

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "flex-end",
                  mt: 4,
                  backgroundColor: "background.paper",
                }}
              >
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate(-1)}
                  sx={{ textTransform: "none" }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleOpenDialog}
                  sx={{ textTransform: "none" }}
                >
                  Confirmar Reserva
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Card>

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle sx={{ fontWeight: 600 }}>
            <BsBookHalf style={{ marginRight: 8 }} />
            Confirmar Reserva
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Você está prestes a reservar o livro:
              <br />
              <strong>"{livro.titulo}"</strong>
              <br />
              <br />
              Data limite para devolução:
            </DialogContentText>
            <Chip
              label={format(dataDevolucao, "dd/MM/yyyy")}
              color="success"
              variant="outlined"
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button
              onClick={solicitarEmprestimo}
              variant="contained"
              color="primary"
            >
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </div>
  );
};

const DetailItem = ({ icon, title, value, valueColor }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      backgroundColor: "background.paper",
    }}
  >
    <Box sx={{ color: "primary.main", backgroundColor: "background.paper" }}>
      {icon}
    </Box>
    <Box sx={{ backgroundColor: "background.paper" }}>
      <Typography variant="subtitle2" color="textSecondary">
        {title}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 500, color: valueColor }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

export default EmprestimoLivro;
