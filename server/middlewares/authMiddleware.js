const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Token não fornecido' });
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido' });
        }

        const usuario = await Usuario.findById(decoded.id);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        req.usuario = decoded;
        next();
    });
};

module.exports = { verifyToken };
