import { getAutoStatusMessage, isAutoStatusOn } from '../lib/autostatus.js';

const statusReplyHandler = async (update, sock) => {
  try {
    if (!isAutoStatusOn()) return;
    if (!update.messages) return;

    for (const msg of update.messages) {
      const fromStatus = msg.key.remoteJid === 'status@broadcast';
      const participant = msg.key.participant;

      if (fromStatus && participant) {
        // Simulate viewing the status
        await sock.readMessages([msg.key]);

        // Wait a bit to act like a human
        await new Promise(r => setTimeout(r, 2000));

        // Reply to the status as you
        await sock.sendMessage(participant, {
          text: getAutoStatusMessage()
        }, {
          quoted: msg
        });
      }
    }
  } catch (err) {
    console.error('AutoStatus error:', err);
  }
};

export default statusReplyHandler;
