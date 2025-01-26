const express = require('express');
const { verifyToken } = require('../middlewares/authMiddleware');
const {
  getReservasUsuario,
  criarReserva,
  cancelarReserva,
  getTodasReservas,
} = require('../controllers/reservaController');

const router = express.Router();

// Rotas para reservas
router.get('/', verifyToken, getReservasUsuario); // Obter reservas do usuário autenticado
router.post('/', verifyToken, criarReserva); // Criar uma nova reserva
router.delete('/:id', verifyToken, cancelarReserva); // Cancelar uma reserva do usuário
router.get('/admin', verifyToken, getTodasReservas); // Obter todas as reservas (Admin)

module.exports = router;
