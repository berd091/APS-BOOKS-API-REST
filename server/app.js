require('dotenv').config();
const express = require('express');
const MongoDB = require('./config/db');
const bodyParser = require('body-parser');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const livrosRoutes = require('./routes/livrosRoutes');
const emprestimoRoutes = require('./routes/emprestimoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const reservaRoutes = require('./routes/reservaRoutes');

const iniciarCronJob = require('./config/cronReserva');
const iniciarCronEmprestimo = require('./config/cronEmprestimo');

const app = express();
app.use(cors());
app.use(bodyParser.json());

MongoDB.connect()
  .then(() => {
    app.use('/auth', authRoutes);
    app.use('/livros', livrosRoutes);
    app.use('/emprestimo', emprestimoRoutes);
    app.use('/usuarios', usuarioRoutes);
    app.use('/reservas', reservaRoutes);

    iniciarCronJob();
    iniciarCronEmprestimo();
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  })
  .catch((err) => {
    console.error('Erro ao conectar ao banco de dados. Servidor não iniciado.', err);
  });
