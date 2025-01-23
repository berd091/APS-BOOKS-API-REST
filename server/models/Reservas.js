const mongoose = require('mongoose');

const ReservaSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuarios', required: true },
  livroId: { type: mongoose.Schema.Types.ObjectId, ref: 'Livros', required: true },
  status: { type: String, enum: ['reservado', 'cancelado', 'emprestado'], required: true },
  dataEmprestimo: { type: Date, required: false },
  dataDevolucao: { type: Date, required: false },
});

module.exports = mongoose.model('Reservas', ReservaSchema);
