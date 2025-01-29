const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const JWT_SECRET = process.env.JWT_SECRET;
const { v4: uuidv4 } = require('uuid');



// Login
const login = async (req, res) => {
	const { email, password } = req.body;

	try {
		const usuario = await Usuario.findOne({ email });

		if (!usuario) {
			return res.status(401).json({ message: 'Credenciais inválidas' });
		}

		else {
			if (!(await bcrypt.compare(password, usuario.password))) {
				return res.status(401).json({ message: 'Credenciais inválidas' });
			}

		}
		const token = jwt.sign({ id: usuario._id, role: usuario.role }, JWT_SECRET, { expiresIn: '1h' });
		res.json({ token });
	} catch (error) {
		res.status(500).json({ message: 'Erro ao autenticar usuário', error });
	}
};

const registerAdmin = async (req, res) => {
	if (req.usuario.role !== 'admin') {
		return res.status(403).json({ message: 'Acesso negado' });
	}

	const { name, email, password } = req.body;

	try {
		const hashedPassword = await bcrypt.hash(password, 10);

		const novoAdmin = new Usuario({
			id: uuidv4(),
			name,
			email,
			password: hashedPassword,
			role: 'admin', 
		});

		const adminSalvo = await novoAdmin.save();
		res.status(201).json({ id: adminSalvo.id, name: adminSalvo.name, email: adminSalvo.email });
	} catch (error) {
		if (error.code === 11000) {
			res.status(400).json({ message: 'Email já cadastrado' });
		} else {
			console.error(error);
			res.status(500).json({ message: 'Erro ao criar usuário' });
		}
	}
};

const getRole = async (req, res) => {
	// console.log(req.usuario.role)
	try {
		res.json({ role: req.usuario.role });
	} catch (error) {
		res.status(500).json({ message: 'Erro ao verificar a autoridade do usuario', error });
	}
};


module.exports = { login, registerAdmin, getRole };
