import React, { useState } from "react";
import { TextField, Button, Container, Typography, Box, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { AccountCircle, Lock } from "@mui/icons-material";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const Login = () => {
	const [formData, setFormData] = useState({ email: "", password: "" });
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const navigate = useNavigate();
	const [openSnackbar, setOpenSnackbar] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");
	const [snackbarSeverity, setSnackbarSeverity] = useState("");

	const handleCloseSnackbar = (event, reason) => {
		if (reason === "clickaway") return;
		setOpenSnackbar(false);
	};

	const showSnackbar = (message, severity) => {
		setSnackbarMessage(message);
		setSnackbarSeverity(severity);
		setOpenSnackbar(true);
	};

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		try {
			const response = await axios.post("http://localhost:3001/auth/login", formData);
			if (response.status === 200) {
				const { token } = response.data;
				localStorage.setItem("authToken", token);
				showSnackbar("Login feito com sucesso!", "success");
				setTimeout(() => {
					navigate("/catalogo");
				}, 2000);
			}
		} catch (err) {
			showSnackbar("Email ou senha inválidos.", "error");
		}
	};

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
					Login
				</Typography>
				<form onSubmit={handleSubmit}>
					<TextField
						label="Email"
						name="email"
						type="email"
						value={formData.email}
						onChange={handleChange}
						fullWidth
						margin="normal"
						required
						autoComplete="email"
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<AccountCircle />
								</InputAdornment>
							),
						}}
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
						autoComplete="current-password"
						inputProps={{
							onPaste: (e) => {
								e.preventDefault();
							},
						}}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<Lock />
								</InputAdornment>
							),
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
					<Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
						Entrar
					</Button>
				</form>
				<Typography variant="body2" align="center" sx={{ mt: 3 }}>
					Não tem cadastro?{" "}
					<Link to="/cadastro" style={{ textDecoration: "none", color: "#1976d2" }}>
						Cadastre-se agora!
					</Link>
				</Typography>
			</Box>
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
		</Container>
	);
};

export default Login;
