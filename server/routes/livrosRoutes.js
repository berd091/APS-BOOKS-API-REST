const express = require('express');
const { verifyToken } = require('../middlewares/authMiddleware');
const {
    getLivros,
    getLivroById,
    createLivro,
    updateLivro,
    deleteLivro,
} = require('../controllers/livrosController');

const router = express.Router();

// Rotas para livros
router.get('/', verifyToken, getLivros); // Obter todos os livros
router.get('/:livroId', verifyToken, getLivroById); // Obter um livro específico
router.post('/', verifyToken, createLivro); // Adicionar um novo livro (somente admin)
router.patch('/:livroId', verifyToken, updateLivro); // Atualizar um livro (somente admin)
router.delete('/:livroId', verifyToken, deleteLivro); // Deletar um livro (somente admin)

module.exports = router;
