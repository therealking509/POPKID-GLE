import config from '../../config.cjs';

const Callupdate = async (json, sock) => {
   for (const id of json) {
      if (id.status === 'offer' && config.REJECT_CALL) {
         await sock.sendMessage(id.from, {
            text: `
╭━━〔 🚫  𝑪𝑨𝑳𝑳 𝑹𝑬𝑱𝑬𝑪𝑻𝑬𝑫 〕━━╮

📱 *Auto Call Blocker Activated!*
🔕 Calls are *not* allowed right now.

🛑 Please avoid calling this bot!

╰━━━━━━━━━━━━━━━━━━━━━╯
POWERED BY *POPKID*
            `.trim(),
            mentions: [id.from],
         });

         await sock.rejectCall(id.id, id.from);
      }
   }
};

export default Callupdate;
