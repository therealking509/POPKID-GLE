import fetch from 'node-fetch';
import config from '../../config.cjs';

const pairCommand = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (cmd === 'pair') {
    try {
      await m.React("🔄");

      const res = await fetch('https://popkidsessgenerator.onrender.com/pair');
      const data = await res.json();

      if (!data || !data.code || !data.message) {
        await m.reply("⚠️ Could not retrieve pairing code. Please try again later.");
        await m.React("❌");
        return;
      }

      const message = `
╭━━〔 🔐 *POPKID SESSION PAIRING* 〕━━⬣
┃
┃ 📥 *Pairing Code:* \`\`\`${data.code}\`\`\`
┃ 🧾 *Note:* ${data.message || 'Paste this code into WhatsApp > Linked Devices'}
┃
┃ 📌 *How to Use:*
┃ 1. Open WhatsApp on your phone
┃ 2. Tap ⋮ > Linked Devices > Link a Device
┃ 3. Paste this pairing code when prompted
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━⬣
`.trim();

      await sock.sendMessage(m.from, {
        text: message
      }, { quoted: m });

      await m.React("✅");

    } catch (error) {
      console.error("Error in .pair command:", error);
      await m.reply("❌ *An error occurred while fetching the pairing code. Try again later.*");
      await m.React("❌");
    }
  }
};

export default pairCommand;
