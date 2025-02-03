const mongoose = require('mongoose');

const ReservaSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuarios', required: true },
  livroId: { type: String, ref: 'Livros', required: true },
  status: { type: String, enum: ['reservado', 'cancelado', 'cancelado bibliotecario', 'emprestado'], required: true },
  dataReserva: { type: Date, required: false },
  dataLimite: { type: Date, required: false },
  dataAtualizacao: { type: Date, required: false },
});

module.exports = mongoose.model('Reservas', ReservaSchema);
