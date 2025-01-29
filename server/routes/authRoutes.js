const express = require('express');
const { login, registerAdmin, getRole } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Rotas de autenticação
router.post('/login', login);
router.post('/register', verifyToken, registerAdmin);
router.get("/role", verifyToken, getRole);

module.exports = router;
