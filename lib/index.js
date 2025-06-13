import config from './config.cjs';

const typingCooldowns = new Map();

Matrix.ev.on('messages.upsert', async ({ messages }) => {
  const m = messages[0];
  const chatId = m?.key?.remoteJid;
  if (!m || chatId === 'status@broadcast') return;

  if (config.AUTO_TYPING) {
    const last = typingCooldowns.get(chatId) || 0;
    if (Date.now() - last > 5000) {
      typingCooldowns.set(chatId, Date.now());
      try {
        await Matrix.sendPresenceUpdate('composing', chatId);
      } catch (e) {
        console.error('[AutoTyping]', e.message);
      }
    }
  }

  // run your commands
});
