const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Listar todos os usuários (Apenas admin)
const getUsuarios = async (req, res) => {
    if (req.usuario.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso restrito para administradores' });
    }

    try {
        const usuarios = await Usuario.find().select('-password');
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar usuários' });
    }
};

// Obter informações do próprio perfil
const getPerfilUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuario.id).select('-password');

        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        res.json(usuario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar informações do usuário' });
    }
};

// Criar um novo usuário (Cadastro)
const criarUsuario = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const novoUsuario = new Usuario({
            id: uuidv4(),
            name,
            email,
            password: hashedPassword,
            role: 'usuario', 
        });

        const usuarioSalvo = await novoUsuario.save();
        res.status(201).json({ id: usuarioSalvo.id, name: usuarioSalvo.name, email: usuarioSalvo.email });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Email já cadastrado' });
        } else {
            console.error(error);
            res.status(500).json({ message: 'Erro ao criar usuário' });
        }
    }
};

// Atualizar informações do próprio perfil
const atualizarUsuario = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const atualizacoes = {};
        if (name) atualizacoes.name = name;
        if (email) atualizacoes.email = email;
        if (password) atualizacoes.password = await bcrypt.hash(password, 10);

        const usuarioAtualizado = await Usuario.findByIdAndUpdate(req.usuario.id, atualizacoes, { new: true });

        if (!usuarioAtualizado) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        res.json({ id: usuarioAtualizado.id, name: usuarioAtualizado.name, email: usuarioAtualizado.email });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar informações do usuário' });
    }
};

// Deletar o próprio perfil
const deletarUsuario = async (req, res) => {
    try {
        const usuarioDeletado = await Usuario.findByIdAndDelete(req.usuario.id);

        if (!usuarioDeletado) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        res.status(204).end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar o usuário' });
    }
};

module.exports = {
    getUsuarios,
    getPerfilUsuario,
    criarUsuario,
    atualizarUsuario,
    deletarUsuario,
};
