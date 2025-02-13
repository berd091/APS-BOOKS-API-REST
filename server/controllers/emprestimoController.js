const Emprestimo = require('../models/Emprestimos');
const Livro = require('../models/Livros');
const Usuario = require('../models/Usuario');


// Obter histórico de empréstimos de um usuário
const getHistoricoEmprestimosUsuario = async (req, res) => {
    try {
        const emprestimosUsuario = await Emprestimo.find({
            usuarioId: req.usuario.id,
        }).exec();

        const emprestimosComLivros = await Promise.all(
            emprestimosUsuario.map(async (emprestimo) => {
                const livro = await Livro.findOne({ livroId: emprestimo.livroId });
                return {
                    ...emprestimo._doc,
                    livro: livro
                        ? { titulo: livro.titulo, capa: null }
                        : { titulo: "Título desconhecido", capa: null },
                };
            })
        );

        res.json(emprestimosComLivros);
    } catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ message: "Erro ao buscar histórico de empréstimos" });
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
    const { email } = req.query; 

    if (!email) {
        return res.status(400).json({ message: 'E-mail é obrigatório para a busca' });
    }

    try {

        const usuario = await Usuario.findOne({ email });

        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        const emprestimos = await Emprestimo.aggregate([
            {
                $match: { usuarioId: usuario._id },
            },
            {
                $lookup: {
                    from: 'livros', 
                    localField: 'livroId', 
                    foreignField: 'livroId', 
                    as: 'livro',
                },
            },
            {
                $unwind: '$livro',
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

        if (emprestimo.extendido) {
            return res.status(400).json({ message: 'Este empréstimo já foi estendido uma vez.' });
        }

        const novaDataDevolucao = new Date(emprestimo.dataDevolucao);
        novaDataDevolucao.setDate(novaDataDevolucao.getDate() + 15);

        emprestimo.dataDevolucao = novaDataDevolucao.toISOString();
        emprestimo.extendido = true; 

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
        emprestimo.dataDevolucao = new Date(); 
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
        return res.status(403).json({ message: 'Acesso restrito! Apenas para administradores' });
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
