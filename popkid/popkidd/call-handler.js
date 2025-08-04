import config from '../../config.cjs';

const Callupdate = async (json, sock) => {
  for (const id of json) {
    if (id.status === 'offer' && config.REJECT_CALL) {
      const warningText = `
╔══ 🚫 *CALL ALERT* ══╗

📞 *Incoming Call Blocked!*
🚷 Calling the bot is *not allowed*.
⚠️ *Auto-block is active.*

💬 Please use *text commands only*.

╚══  *POPKID🪆🪆🪆* ══╝
      `.trim();

      await sock.sendMessage(id.from, {
        text: warningText,
        mentions: [id.from],
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: "POPKID-XTECH 🚫",
            newsletterJid: "120363290715861418@newsletter"
          }
        }
      });

      await sock.rejectCall(id.id, id.from);
    }
  }
};

export default Callupdate;
