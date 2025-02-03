const Reserva = require('../models/Reservas');
const Livro = require('../models/Livros');
const Usuario = require("../models/Usuario");
const Emprestimo = require("../models/Emprestimos");

// Obter todas as reservas do usuário
const getReservasUsuario = async (req, res) => {
    try {
        const reservasUsuario = await Reserva.find({ usuarioId: req.usuario.id })
            .exec();
        const reservasComLivros = await Promise.all(
            reservasUsuario.map(async (reserva) => {
                const livro = await Livro.findOne({livroId: reserva.livroId});
                return{
                    ...reserva._doc,
                    livro: livro
                        ? { titulo: livro.titulo, capa: null}
                        : { titulo: "Título desconhecido", capa: null },
                };
            })
        );

        res.json(reservasComLivros);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar reservas' });
    }
};

const getReservaPorEmail = async (req, res) => {
    const { email } = req.query;
    if (!email) {
        return res.status(400).json({ message: 'E-mail é obrigatório para a busca' });
    }

    try {

        const usuario = await Usuario.findOne({ email });

        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        const reservas = await Reserva.aggregate([
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

        res.json(reservas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar empréstimos pelo e-mail' });
    }
}

// Criar uma nova reserva
const criarReserva = async (req, res) => {
    const livroId = req.params.livroId;

    try {
        const livro = await Livro.findOne({ livroId });

        if (!livro) {
            return res.status(404).json({ message: 'Livro não encontrado' });
        }

        if (!livro.disponivel) {
            return res.status(400).json({ message: 'Livro não está disponível para reserva' });
        }
        const hoje = new Date();
        const dataLimite = new Date();
        dataLimite.setDate(hoje.getDate() + 7);
        const novaReserva = new Reserva({
            usuarioId: req.usuario.id,
            livroId,
            status: 'reservado',
            dataReserva: hoje.toISOString(),
            dataLimite: dataLimite.toISOString(),
            dataAtualizacao: hoje.toISOString(),
        });

        await novaReserva.save();

        livro.disponivel = false;
        await livro.save();

        res.status(201).json(novaReserva);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao criar reserva'});
    }
};

// Cancelar uma reserva
const cancelarReserva = async (req, res) => {
    const reservaId = req.params.id;

    try {
        const reserva = await Reserva.findOne({ _id: reservaId, usuarioId: req.usuario.id  });

        if (!reserva) {
            return res.status(404).json({ message: 'Reserva não encontrada' });
        }
        if (!reserva.status === "reservado") {
            return res.status(404).json({ message: 'Reserva não pode ser cancelada' });
        }
        reserva.status = 'cancelado';
        const hoje = new Date();
        reserva.dataAtualizacao = hoje.toISOString();
        await reserva.save();

        const livro = await Livro.findOne({livroId: reserva.livroId});
        if (livro) {
            livro.disponivel = true;
            await livro.save();
        }

        res.json({ message: 'Reserva cancelada com sucesso!', reserva });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao cancelar reserva' });
    }
};

const cancelarReservaAdmin = async (req, res) => {
    if (req.usuario.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso restrito! Apenas para administradores!' });
    }
    const reservaId = req.params.id;

    try {
        const reserva = await Reserva.findOne({ _id: reservaId});

        if (!reserva) {
            return res.status(404).json({ message: 'Reserva não encontrada' });
        }
        if (!reserva.status === "reservado") {
            return res.status(404).json({ message: 'Reserva não pode ser cancelada' });
        }
        reserva.status = 'cancelado bibliotecario'
        const hoje = new Date();
        reserva.dataAtualizacao = hoje.toISOString();
        await reserva.save();

        const livro = await Livro.findOne({livroId: reserva.livroId});
        if (livro) {
            livro.disponivel = true;
            await livro.save();
        }

        res.json({ message: 'Reserva cancelada com sucesso!', reserva });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao cancelar reserva' });
    }
};

// Obter todas as reservas (Apenas admin)
const getTodasReservas = async (req, res) => {
    if (req.usuario.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso restrito para administradores' });
    }

    try {
        const reservas = await Reserva.find()
            .populate('usuarioId', 'name email')
            .populate('livroId', 'titulo autor');
        res.json(reservas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar reservas' });
    }
};

const registrarEmprestimo = async (req, res) => {
    const reservaId = req.params.id;

    try{
        const reserva = await Reserva.findOne({ _id: reservaId });

        if (!reserva) {
            return res.status(404).json({ message: 'Reserva não encontrada ou acesso negado' });
        }
        if(reserva.status !== 'reservado') {
            return res.status(404).json({ message: 'Reserva já cancelado ou utilizada!' });
        }
        const livro = Livro.findOne({livroId: reserva.livroId});
        if (!livro) {
            return res.status(404).json({ message: 'Livro reservado não encontrado!' });
        }
        const hoje = new Date();
        const dataDevolucao = new Date();
        dataDevolucao.setDate(hoje.getDate() + 15);
        const novoEmprestimo = new Emprestimo({
            usuarioId: reserva.usuarioId,
            livroId: reserva.livroId,
            status: 'emprestado',
            dataEmprestimo: hoje.toISOString(),
            dataDevolucao: dataDevolucao.toISOString(),
        });

        await novoEmprestimo.save();

        reserva.status = 'emprestado';
        reserva.dataAtualizacao = hoje.toISOString();
        await reserva.save();

        res.status(201).json({
            message: 'Empréstimo registrado com sucesso',
            emprestimo: novoEmprestimo,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao registrar empréstimo' });
    }
}

module.exports = {
    getReservasUsuario,
    getReservaPorEmail,
    criarReserva,
    cancelarReserva,
    getTodasReservas,
    registrarEmprestimo,
    cancelarReservaAdmin,
};
