const express = require('express');
const { verifyToken } = require('../middlewares/authMiddleware');
const {
    getUsuarios,
    getPerfilUsuario,
    criarUsuario,
    atualizarUsuario,
    deletarUsuario,
} = require('../controllers/usuarioController');

const router = express.Router();

// Rotas para usuários
router.get('/', verifyToken, getUsuarios); // Listar todos os usuários (Admin)
router.get('/me', verifyToken, getPerfilUsuario); // Obter informações do próprio perfil
router.post('/', criarUsuario); // Criar novo usuário
router.put('/me', verifyToken, atualizarUsuario); // Atualizar informações do próprio perfil
router.delete('/me', verifyToken, deletarUsuario); // Deletar o próprio perfil

module.exports = router;
