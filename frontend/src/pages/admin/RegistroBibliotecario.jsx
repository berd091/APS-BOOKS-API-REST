import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Avatar,
  Grid,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Fade,
} from "@mui/material";
import {
  HowToReg,
  Visibility,
  VisibilityOff,
  AdminPanelSettings,
} from "@mui/icons-material";

const RegistroBibliotecario = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verificarPermissao = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get("http://localhost:3001/auth/role", {
          headers: { authorization: `Bearer ${token}` },
        });

        if (response.data.role !== "admin") {
          navigate("/");
        }
      } catch (error) {
        navigate("/");
      }
    };

    verificarPermissao();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        "http://localhost:3001/auth/register",
        formData,
        {
          headers: {
            authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage({
        text: "Administrador registrado com sucesso!",
        type: "success",
      });
      setFormData({ name: "", email: "", password: "" });
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage({
        text:
          error.response?.data?.message || "Erro ao registrar administrador",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
        <Box
          sx={{
            textAlign: "center",
            mb: 4,
            backgroundColor: "background.paper",
          }}
        >
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 56,
              height: 56,
              mx: "auto",
              mb: 2,
            }}
          >
            <AdminPanelSettings fontSize="large" />
          </Avatar>
          <Typography variant="h4" component="h1" gutterBottom>
            Registrar Novo Bibliotecário
          </Typography>
          <Typography color="textSecondary">
            Preencha os dados do novo administrador do sistema
          </Typography>
        </Box>

        <Fade in={!!message.text}>
          <Alert
            severity={message.type}
            sx={{ mb: 3 }}
            onClose={() => setMessage("")}
          >
            {message.text}
          </Alert>
        </Fade>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome Completo"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                autoFocus
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                variant="outlined"
                inputProps={{
                  pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Senha"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={loading}
                startIcon={
                  loading ? <CircularProgress size={20} /> : <HowToReg />
                }
                sx={{ py: 1.5, mt: 2 }}
              >
                {loading ? "Registrando..." : "Registrar Administrador"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default RegistroBibliotecario;
