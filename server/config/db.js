const mongoose = require('mongoose');

class MongoDB {
  static connection = null;

  static async connect() {
    if (!MongoDB.connection) {
      try {
        MongoDB.connection = await mongoose.connect(process.env.MONGO_URI);
        console.log('Conectado ao MongoDB com sucesso!');
      } catch (error) {
        console.error('Erro ao conectar ao MongoDB:', error);
        process.exit(1);
      }
    }
    return MongoDB.connection;
  }
}

module.exports = MongoDB;
