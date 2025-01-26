const Livro = require('../models/Livros');
const { v4: uuidv4 } = require('uuid');

// Obter todos os livros (com filtros opcionais)
const getLivros = async (req, res) => {
    const { categoria, disponivel } = req.query;

    try {
        let query = {};

        if (categoria) query.categoria = categoria;
        if (disponivel !== undefined) query.disponivel = disponivel === 'true';

        const livros = await Livro.find(query);
        res.json(livros);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar livros' });
    }
};

// Obter detalhes de um livro
const getLivroById = async (req, res) => {
    const { livroId } = req.params;

    try {
        const livro = await Livro.findOne({ livroId });

        if (!livro) {
            return res.status(404).json({ message: 'Livro não encontrado' });
        }

        res.json(livro);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar detalhes do livro' });
    }
};

// Adicionar um novo livro
const createLivro = async (req, res) => {
    if (req.usuario.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso restrito para administradores' });
    }

    try {
        const novoLivro = new Livro({ ...req.body, livroId: uuidv4(), disponivel: true });
        await novoLivro.save();

        res.status(201).json(novoLivro);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao adicionar livro' });
    }
};

// Atualizar informações de um livro
const updateLivro = async (req, res) => {
    if (req.usuario.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso restrito para administradores' });
    }

    const { livroId } = req.params;
    const atualizacoes = req.body;

    try {
        const livroAtualizado = await Livro.findOneAndUpdate(
            { livroId },
            atualizacoes,
            { new: true } // Retorna o documento atualizado
        );

        if (!livroAtualizado) {
            return res.status(404).json({ message: 'Livro não encontrado' });
        }

        res.json({ message: 'Livro atualizado com sucesso', livro: livroAtualizado });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar livro' });
    }
};

// Deletar um livro
const deleteLivro = async (req, res) => {
    if (req.usuario.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso restrito para administradores' });
    }

    const { livroId } = req.params;

    try {
        const livro = await Livro.findOneAndDelete({ livroId });

        if (!livro) {
            return res.status(404).json({ message: 'Livro não encontrado' });
        }

        res.status(204).end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar livro' });
    }
};

module.exports = {
    getLivros,
    getLivroById,
    createLivro,
    updateLivro,
    deleteLivro,
};
