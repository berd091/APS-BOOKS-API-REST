const mongoose = require('mongoose');

const LivroSchema = new mongoose.Schema({
  livroId: { type: String, required: true, unique: true },
  titulo: { type: String, required: true },
  autor: { type: String, required: true },
  sinopse: { type: String, required: true },
  categoria: { type: String, required: true },
  ano: { type: Number, required: true },
  disponivel: { type: Boolean, required: true, default: true },
  imageUrl: { type: String },
});

module.exports = mongoose.model('Livros', LivroSchema);
