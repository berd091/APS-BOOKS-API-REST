import React, { useState, useEffect } from "react";
import axios from "axios";
import { TextField, Button, Card, CardContent, Typography, Grid2, Snackbar } from "@mui/material";
import NavBar from "../../components/navBar/navBar";
import { useNavigate } from "react-router-dom";

const RegistrarEmprestimo = () => {
    const [email, setEmail] = useState("");
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
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


    const buscarReservas = async () => {
        setLoading(true);
        setReservas([]);
        setErrorMessage("");

        try {
            const token = localStorage.getItem("authToken");
            const response = await axios.get(`http://localhost:3001/reservas/buscar?email=${email}`, {
                headers: {
                    authorization: `Bearer ${token}`,
                },
            });

            setReservas(response.data);
        } catch (error) {
            setErrorMessage("Erro ao buscar reservas. Verifique o e-mail ou tente novamente.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegistrarEmprestimo = async (reservaId) => {
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const token = localStorage.getItem("authToken");
            await axios.post(
                `http://localhost:3001/reservas/emprestimo/${reservaId}`,
                {},
                {
                    headers: {
                        authorization: `Bearer ${token}`,
                    },
                }
            );

            setSuccessMessage("Empréstimo registrado com sucesso!");
            buscarReservas();
        } catch (error) {
            setErrorMessage("Erro ao registrar empréstimo. Tente novamente.");
            console.error(error);
        }
    };
    const handleCancelarReserva = async (reservaId) => {
        setErrorMessage("");
        setSuccessMessage("");
        try {
            const token = localStorage.getItem("authToken");
            await axios.put(
                `http://localhost:3001/reservas/cancelar/${reservaId}`,
                {},
                {
                    headers: {
                        authorization: `Bearer ${token}`,
                    },
                }
            );

            setSuccessMessage("Empréstimo registrado com sucesso!");
            buscarReservas();
        } catch (error) {
            setErrorMessage("Erro ao registrar empréstimo. Tente novamente.");
            console.error(error);
        }
    }
    return (
        <>
            <NavBar />
            <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
                <Typography variant="h4" gutterBottom textAlign="center">
                    Registro de Empréstimos
                </Typography>
                <Card style={{ marginBottom: "20px", padding: "20px" }}>
                    <Typography variant="h6" gutterBottom>
                        Buscar Reservas por E-mail
                    </Typography>
                    <Grid2 container spacing={2} alignItems="center">
                        <Grid2 item xs={9}>
                            <TextField
                                fullWidth
                                label="E-mail do Usuário"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                variant="outlined"
                            />
                        </Grid2>
                        <Grid2 item xs={3}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={buscarReservas}
                                disabled={loading || !email}
                            >
                                {loading ? "Buscando..." : "Buscar"}
                            </Button>
                        </Grid2>
                    </Grid2>
                </Card>

                {reservas.length > 0 && (
                    <div>
                        <Typography variant="h5" gutterBottom>
                            Reservas Encontradas
                        </Typography>
                        {reservas.map((reserva) => (
                            <Card key={reserva._id} style={{ marginBottom: "15px" }}>
                                <CardContent>
                                    <Typography variant="subtitle1">
                                        <strong>Livro:</strong> {reserva.livro.titulo}
                                    </Typography>
                                    <Typography variant="subtitle1">
                                        <strong>Data da Reserva:</strong> {new Date(reserva.dataReserva).toLocaleDateString()}
                                    </Typography>
                                    {reserva.status !== "devolvido" ? (
                                        <Typography variant="subtitle1">
                                            <strong>Prazo de Coleta:</strong> {new Date(reserva.dataLimite).toLocaleDateString()}
                                        </Typography>
                                    ) : (
                                        <Typography variant="subtitle1">
                                            <strong>Data de Atualização:</strong> {new Date(reserva.dataAtualizacao).toLocaleDateString()}
                                        </Typography>)}

                                    <Typography variant="subtitle1">
                                        <strong>Status:</strong> {reserva.status}
                                    </Typography>
                                    {reserva.status === "reservado" && (
                                        <Button
                                            variant="contained"
                                            color="success"
                                            style={{ marginTop: "10px" }}
                                            onClick={() => handleRegistrarEmprestimo(reserva._id)}
                                        >
                                            Registrar Emprestimo
                                        </Button>
                                    )}
                                    {reserva.status === "reservado" && (
                                        <Button
                                            variant="contained"
                                            color="error"
                                            style={{ marginTop: "10px", marginLeft: "10px"}}
                                            onClick={() => handleCancelarReserva(reserva._id)}
                                        >
                                            Cancelar Reserva
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {errorMessage && (
                    <Snackbar
                        open={Boolean(errorMessage)}
                        onClose={() => setErrorMessage("")}
                        message={errorMessage}
                        autoHideDuration={6000}
                    />
                )}
                {successMessage && (
                    <Snackbar
                        open={Boolean(successMessage)}
                        onClose={() => setSuccessMessage("")}
                        message={successMessage}
                        autoHideDuration={6000}
                    />
                )}

                {!loading && reservas.length === 0 && email && (
                    <Typography variant="subtitle1" style={{ marginTop: "20px" }}>
                        Nenhuma reserva encontrada para este e-mail.
                    </Typography>
                )}
            </div>
        </>
    );
};

export default RegistrarEmprestimo;
