import React, { useState } from "react";
import { TextField, Button, Container, Typography, Box, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const Cadastro = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [error, setError] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não correspondem.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3001/usuarios", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      if (response.status === 201) {
        showSnackbar("Usuário cadastrado com sucesso!", "success");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
      
    } catch (err) {
      if (err.response && err.response.data.code === 11000) {
        showSnackbar("Este email já está cadastrado.", "error");
      } else {
        showSnackbar("Erro ao cadastrar usuário. Tente novamente.", "error");
      }
    }};

  return (
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
          Cadastro
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Nome"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Senha"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            inputProps={{
              onPaste: (e) => {
                e.preventDefault();
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Confirmar Senha"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            inputProps={{
              onPaste: (e) => {
                e.preventDefault();
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
          >
            Cadastrar
          </Button>
        </form>
        <Snackbar
          open={openSnackbar}
          autoHideDuration={2000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <MuiAlert
            onClose={handleCloseSnackbar}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
            elevation={6}
            variant="filled"
          >
            {snackbarMessage}
          </MuiAlert>
        </Snackbar>
      </Box>
      
    </Container>
  );
};

export default Cadastro;
