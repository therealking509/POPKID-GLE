import config from '../../config.cjs';

const statusAutoReply = async (Matrix) => {
  Matrix.ev.on('messages.upsert', async ({ messages, type }) => {
    try {
      if (type !== 'notify') return;

      for (const msg of messages) {
        if (!msg.message || msg.key.fromMe) continue;

        const from = msg.key.remoteJid;

        // Check for WhatsApp Status update
        if (from === 'status@broadcast') {
          const participant = msg.key.participant;

          if (config.STATUS_READ_MSG) {
            await Matrix.sendMessage(participant, {
              text: config.STATUS_READ_MSG
            }, { quoted: msg });
          }
        }
      }
    } catch (err) {
      console.error('❌ Status Auto-Reply Error:', err);
    }
  });
};

export default statusAutoReply;
