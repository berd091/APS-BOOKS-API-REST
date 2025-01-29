const express = require('express');
const { verifyToken } = require('../middlewares/authMiddleware');
const {
    getHistoricoEmprestimosUsuario,
    solicitarEmprestimo,
    extenderEmprestimo,
    registrarDevolucao,
    atualizarStatusEmprestimo,
    getEmprestimosPorEmail,
} = require('../controllers/emprestimoController');

const router = express.Router();

// Rotas para empréstimos
router.get('/historico', verifyToken, getHistoricoEmprestimosUsuario); // Histórico de empréstimos do usuário
router.post('/:livroId', verifyToken, solicitarEmprestimo); // Solicitar um novo empréstimo
router.put('/extender/:id', verifyToken, extenderEmprestimo); // Extender o prazo de devolução
router.post('/return/:id', verifyToken, registrarDevolucao); // Registrar devolução
router.put('/status/:id', verifyToken, atualizarStatusEmprestimo); // Atualizar status (somente admin)
router.get('/buscar', verifyToken, getEmprestimosPorEmail);

module.exports = router;
