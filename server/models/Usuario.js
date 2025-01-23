const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'usuario'], default: 'usuario' },
}, { timestamps: true });

module.exports = mongoose.model('Usuario', usuarioSchema);
