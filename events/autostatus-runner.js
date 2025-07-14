import { getAutoStatusMessage, isAutoStatusOn } from '../lib/autostatus.js';

const AutoStatus = async (sock) => {
  sock.ev.on('connection.update', async ({ connection }) => {
    if (connection === 'open') {
      await sock.presenceSubscribe('status@broadcast');
      console.log('✅ AutoStatus subscribed to status updates');
    }
  });

  sock.ev.on('messages.update', async (updates) => {
    for (const update of updates) {
      try {
        const jid = update.key?.remoteJid;
        const participant = update.key?.participant;
        const id = update.key?.id;

        if (
          jid !== 'status@broadcast' ||
          !participant ||
          !id ||
          !isAutoStatusOn()
        ) continue;

        const msg = await sock.loadMessage(jid, id);
        if (!msg) return;

        await sock.readMessages([update.key]);
        await new Promise((r) => setTimeout(r, 1500));

        await sock.sendMessage(participant, {
          text: getAutoStatusMessage(),
        }, {
          quoted: msg,
        });

        console.log(`✅ Auto-replied to ${participant}'s status`);
      } catch (err) {
        console.error('❌ AutoStatus error:', err);
      }
    }
  });
};

export default AutoStatus;

