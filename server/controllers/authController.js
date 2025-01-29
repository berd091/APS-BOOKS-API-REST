const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const JWT_SECRET = process.env.JWT_SECRET;

// Login
const login = async (req, res) => {
	const { email, password } = req.body;

	try {
		const usuario = await Usuario.findOne({ email });
		// usuario é null
		if (!usuario) {
			return res.status(401).json({ message: 'Credenciais inválidas' });
		}
		// o login é para admin
		if (usuario.role === "admin") {
			if (usuario.password !== password) {
				return res.status(401).json({ message: 'Credenciais inválidas' });
			}
		}
		// o login é para user
		else {
			if (usuario.password !== await bcrypt.compare(password, usuario.password)) {
				return res.status(401).json({ message: 'Credenciais inválidas' });
			}
		}

		// Checagem genérica
		// if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
		//     return res.status(401).json({ message: 'Credenciais inválidas' });
		// }

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

const getRole = async (req, res) => {
	// console.log(req.usuario.role)
	try {
		res.json({ role:req.usuario.role });
	} catch (error) {
		res.status(500).json({ message: 'Erro ao verificar a autoridade do usuario', error });
	}
};


module.exports = { login, registerAdmin, getRole};
