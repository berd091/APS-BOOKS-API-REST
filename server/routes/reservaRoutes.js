const express = require('express');
const { verifyToken } = require('../middlewares/authMiddleware');
const {
  getReservasUsuario,
  criarReserva,
  cancelarReserva,
  getTodasReservas,
  registrarEmprestimo,
  getReservaPorEmail,
  cancelarReservaAdmin,
} = require('../controllers/reservaController');

const router = express.Router();

// Rotas para reservas
router.get('/historico-reservas', verifyToken, getReservasUsuario); // Obter reservas do usuário autenticado
router.post('/:livroId', verifyToken, criarReserva); // Criar uma nova reserva
router.put('/:id', verifyToken, cancelarReserva); // Cancelar uma reserva do usuário
router.get('/admin', verifyToken, getTodasReservas); // Obter todas as reservas (Admin)
router.get('/buscar', verifyToken, getReservaPorEmail);
router.post('/emprestimo/:id', verifyToken, registrarEmprestimo);
router.put('/cancelar/:id', verifyToken, cancelarReservaAdmin);

module.exports = router;
