const Reserva = require('../models/Reservas');
const Livro = require('../models/Livros');

// Obter todas as reservas do usuário
const getReservasUsuario = async (req, res) => {
    try {
        const reservas = await Reserva.find({ usuarioId: req.usuario.id })
            .populate('livroId', 'titulo autor');
        res.json(reservas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar reservas' });
    }
};

// Criar uma nova reserva
const criarReserva = async (req, res) => {
    const { livroId } = req.body;

    try {
        const livro = await Livro.findOne({ livroId });

        if (!livro) {
            return res.status(404).json({ message: 'Livro não encontrado' });
        }

        if (!livro.disponivel) {
            return res.status(400).json({ message: 'Livro não está disponível para reserva' });
        }

        const novaReserva = new Reserva({
            usuarioId: req.usuario.id,
            livroId,
            status: 'reservado',
        });

        await novaReserva.save();

        livro.disponivel = false;
        await livro.save();

        res.status(201).json(novaReserva);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao criar reserva' });
    }
};

// Cancelar uma reserva
const cancelarReserva = async (req, res) => {
    const reservaId = req.params.id;

    try {
        const reserva = await Reserva.findOne({ _id: reservaId, usuarioId: req.usuario.id });

        if (!reserva) {
            return res.status(404).json({ message: 'Reserva não encontrada' });
        }

        const livro = await Livro.findById(reserva.livroId);
        if (livro) {
            livro.disponivel = true;
            await livro.save();
        }

        await Reserva.findByIdAndDelete(reservaId);

        res.status(204).end();
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

module.exports = {
    getReservasUsuario,
    criarReserva,
    cancelarReserva,
    getTodasReservas,
};
