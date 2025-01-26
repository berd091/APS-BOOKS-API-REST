const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const JWT_SECRET = process.env.JWT_SECRET;

// Login
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const usuario = await Usuario.findOne({ email });
        if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        const token = jwt.sign({ id: usuario._id, role: usuario.role }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao autenticar usuário', error });
    }
};

// Registro de Administrador
const registerAdmin = async (req, res) => {
    if (req.usuario.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado' });
    }

    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = await Usuario.create({
            name,
            email,
            password: hashedPassword,
            role: 'admin',
        });

        res.status(201).json(newAdmin);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao registrar administrador', error });
    }
};

module.exports = { login, registerAdmin };
