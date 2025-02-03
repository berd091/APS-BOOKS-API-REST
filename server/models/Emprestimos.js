const mongoose = require('mongoose');

const EmprestimoSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuarios', required: true },
  livroId: { type: String, ref: 'Livros', required: true },
  status: { type: String, enum: ['emprestado', 'devolvido', 'fora do prazo'], required: true },
  dataEmprestimo: { type: Date, required: true },
  dataDevolucao: { type: Date, required: true },
  extendido: { type: Boolean, default: false },
});

module.exports = mongoose.model('Emprestimos', EmprestimoSchema);
