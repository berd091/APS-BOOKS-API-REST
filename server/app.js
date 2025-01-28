require('dotenv').config();
const express = require('express');
const mongoose = require('./config/db');
const bodyParser = require('body-parser');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const livrosRoutes = require('./routes/livrosRoutes');
const emprestimoRoutes = require('./routes/emprestimoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const reservaRoutes = require('./routes/reservaRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Carregar rotas
app.use('/auth', authRoutes);
app.use('/livros', livrosRoutes);
app.use('/emprestimos', emprestimoRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/reservas', reservaRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
