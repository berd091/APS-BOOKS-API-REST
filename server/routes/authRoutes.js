const express = require('express');
const { login, registerAdmin } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Rotas de autenticação
router.post('/login', login);
router.post('/admin', verifyToken, registerAdmin);

module.exports = router;
