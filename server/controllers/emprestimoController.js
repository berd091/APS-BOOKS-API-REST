const Emprestimo = require('../models/Emprestimos');
const Livro = require('../models/Livros');

// Obter histórico de empréstimos de um usuário
const getHistoricoEmprestimosUsuario = async (req, res) => {
    try {
        const emprestimos = await Emprestimo.find({ usuarioId: req.usuario.id })
            .populate('livroId', 'titulo autor');

        res.json(emprestimos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar histórico de empréstimos' });
    }
};

// Solicitar um novo empréstimo
const solicitarEmprestimo = async (req, res) => {
    const livroId = req.params.livroId;

    try {
        const livro = await Livro.findOne({ livroId });

        if (!livro || !livro.disponivel) {
            return res.status(400).json({ message: 'Livro não disponível' });
        }

        const hoje = new Date();
        const dataDevolucao = new Date();
        dataDevolucao.setDate(hoje.getDate() + 15);

        const novoEmprestimo = new Emprestimo({
            usuarioId: req.usuario.id,
            livroId,
            status: 'emprestado',
            dataEmprestimo: hoje.toISOString(),
            dataDevolucao: dataDevolucao.toISOString(),
        });

        await novoEmprestimo.save();

        livro.disponivel = false;
        await livro.save();

        res.status(201).json(novoEmprestimo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao solicitar empréstimo' });
    }
};

// Extender o prazo de devolução de um empréstimo
const extenderEmprestimo = async (req, res) => {
    const emprestimoId = req.params.id;

    try {
        const emprestimo = await Emprestimo.findOne({ _id: emprestimoId, usuarioId: req.usuario.id });

        if (!emprestimo) {
            return res.status(404).json({ message: 'Empréstimo não encontrado ou acesso negado' });
        }

        const novaDataDevolucao = new Date(emprestimo.dataDevolucao);
        novaDataDevolucao.setDate(novaDataDevolucao.getDate() + 15);

        emprestimo.dataDevolucao = novaDataDevolucao.toISOString();
        await emprestimo.save();

        res.json({ message: 'Prazo de devolução estendido', emprestimo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao estender prazo de devolução' });
    }
};

// Registrar devolução de um empréstimo
const registrarDevolucao = async (req, res) => {
    const emprestimoId = req.params.id;

    try {
        const emprestimo = await Emprestimo.findOne({ _id: emprestimoId, usuarioId: req.usuario.id });

        if (!emprestimo) {
            return res.status(404).json({ message: 'Empréstimo não encontrado ou acesso negado' });
        }

        emprestimo.status = 'devolvido';
        await emprestimo.save();

        const livro = await Livro.findOne({ livroId: emprestimo.livroId });
        if (livro) {
            livro.disponivel = true;
            await livro.save();
        }

        res.json({ message: 'Livro devolvido com sucesso', emprestimo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao registrar devolução' });
    }
};

// Atualizar o status de um empréstimo (Admin)
const atualizarStatusEmprestimo = async (req, res) => {
    if (req.usuario.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso restrito para administradores' });
    }

    const emprestimoId = req.params.id;
    const { status } = req.body;

    try {
        const emprestimo = await Emprestimo.findById(emprestimoId);

        if (!emprestimo) {
            return res.status(404).json({ message: 'Empréstimo não encontrado' });
        }

        emprestimo.status = status || emprestimo.status;
        await emprestimo.save();

        res.json(emprestimo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar status do empréstimo' });
    }
};

module.exports = {
    getHistoricoEmprestimosUsuario,
    solicitarEmprestimo,
    extenderEmprestimo,
    registrarDevolucao,
    atualizarStatusEmprestimo,
};
