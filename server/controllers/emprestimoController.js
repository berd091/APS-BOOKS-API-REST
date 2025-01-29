const Emprestimo = require('../models/Emprestimos');
const Livro = require('../models/Livros');
const Usuario = require('../models/Usuario');


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

// Buscar empréstimos pelo e-mail do usuário
const getEmprestimosPorEmail = async (req, res) => {
    const { email } = req.query; // Pegando o e-mail da query string

    if (!email) {
        return res.status(400).json({ message: 'E-mail é obrigatório para a busca' });
    }

    try {
        // Buscar o usuário pelo e-mail
        const usuario = await Usuario.findOne({ email });

        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Buscar os empréstimos associados a esse usuário
        const emprestimos = await Emprestimo.aggregate([
            {
                $match: { usuarioId: usuario._id }, // Filtrar os empréstimos pelo usuário
            },
            {
                $lookup: {
                    from: 'livros', // Nome da coleção de livros
                    localField: 'livroId', // Campo em Emprestimos
                    foreignField: 'livroId', // Campo correspondente em Livros
                    as: 'livro', // Nome do campo resultante
                },
            },
            {
                $unwind: '$livro', // Desaninha o array resultante
            },
        ]);

        res.json(emprestimos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar empréstimos pelo e-mail' });
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
        const emprestimo = await Emprestimo.findOne({ _id: emprestimoId });

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
    getEmprestimosPorEmail,
};
