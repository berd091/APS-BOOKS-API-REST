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
router.get('/', verifyToken, getUsuarios); 
router.get('/me', verifyToken, getPerfilUsuario); 
router.post('/', criarUsuario); 
router.put('/me', verifyToken, atualizarUsuario);
router.delete('/me', verifyToken, deletarUsuario); 

module.exports = router;
