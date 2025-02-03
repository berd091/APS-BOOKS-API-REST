const cron = require('node-cron');
const MongoDB = require('./db');
const Reserva = require('../models/Reservas');

async function atualizarReservasVencidas() {
    try {
        await MongoDB.connect(); // Conecta ao banco antes de rodar o script

        console.log('🔍 Verificando reservas vencidas...');

        const now = new Date();
        const result = await Reserva.updateMany(
            { dataLimite: { $lt: now }, status: 'reservado' },
            { $set: { status: 'fora do prazo', dataAtualizacao: now } }
        );

        console.log(`✅ ${result.modifiedCount} reservas foram atualizadas para "fora do prazo".`);
    } catch (error) {
        console.error('❌ Erro ao atualizar reservas vencidas:', error);
    }
}

// Função para iniciar o cron job
function iniciarCronJob() {
    cron.schedule('0 0 * * *', () => {
        atualizarReservasVencidas();
        console.log('⏳ Agendamento de verificação de reservas iniciado...');
    });

    // Executa a verificação imediatamente ao iniciar o servidor
    atualizarReservasVencidas();
}

module.exports = iniciarCronJob;
