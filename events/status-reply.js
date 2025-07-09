import { getAutoStatusSettings } from '../lib/autostatus.js';

const statusReplyHandler = async (update, sock) => {
  const { enabled, message } = getAutoStatusSettings();

  if (!enabled || !update?.messages) return;

  for (const msg of update.messages) {
    try {
      if (msg.key?.remoteJid?.startsWith('status@broadcast')) {
        const jid = msg.key.participant || msg.participant;
        if (jid && message) {
          await sock.sendMessage(jid, { text: message }, { quoted: msg });
        }
      }
    } catch (err) {
      console.error('Status Reply Error:', err);
    }
  }
};

export default statusReplyHandler;
