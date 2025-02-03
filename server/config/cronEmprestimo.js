const cron = require('node-cron');
const MongoDB = require('./db'); // Importa a conexão do banco
const Emprestimo = require('../models/Emprestimos'); // Importa o modelo Emprestimos

async function atualizarEmprestimosForaDoPrazo() {
    try {
        await MongoDB.connect(); // Garante que o banco está conectado

        console.log('🔍 Verificando empréstimos fora do prazo...');

        const now = new Date();
        const result = await Emprestimo.updateMany(
            { dataDevolucao: { $lt: now }, status: 'emprestado' },
            { $set: { status: 'fora do prazo' } }
        );

        console.log(`✅ ${result.modifiedCount} empréstimos foram atualizados para "fora do prazo".`);
    } catch (error) {
        console.error('❌ Erro ao atualizar empréstimos fora do prazo:', error);
    }
}

// Agendar o cron job para rodar a cada 10 minutos
function iniciarCronEmprestimo() {
    cron.schedule('0 0 * * *', () => {
        atualizarEmprestimosForaDoPrazo();
        console.log('⏳ Verificação de empréstimos fora do prazo iniciada...');
    });

    // Executa a verificação imediatamente ao iniciar o servidor
    atualizarEmprestimosForaDoPrazo();
}

module.exports = iniciarCronEmprestimo;
