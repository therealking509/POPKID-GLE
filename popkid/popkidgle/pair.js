import axios from "axios";
import config from '../../config.cjs';

const pairCommand = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";
  const args = m.body.trim().split(/\s+/).slice(1);
  const phone = args[0];

  const validCommands = ["pair", "paircode", "code"];
  if (!validCommands.includes(cmd)) return;

  if (!phone) {
    return m.reply(`📲 *Please provide a phone number!*\n\n📌 *Usage:* \`${prefix}pair <number>\`\n👉 Example: \`${prefix}pair 254712345678\``);
  }

  try {
    await m.React("⏳");

    const response = await axios.get(`https://popkidsessgenerator.onrender.com/pair?phone=${encodeURIComponent(phone)}`);
    const data = response.data;

    if (!data?.pair_code) {
      await m.React("❌");
      return m.reply("⚠️ *Pair code not found!*\nPlease ensure the number is valid and try again.");
    }

    const message = `
╭───「 🔐 *POPKID WHATSAPP PAIRING* 」───╮
│
│ 👤 *Phone:* \`\`\`${phone}\`\`\`
│ 🔑 *Pair Code:* \`\`\`${data.pair_code}\`\`\`
│
│ 📌 *Steps to Link Device:*
│ 1. Open WhatsApp > Linked Devices
│ 2. Tap ➕ Link a Device
│ 3. Paste the code above
│
╰─────────────────────────────╯
`.trim();

    await sock.sendMessage(m.from, {
      text: message,
      contextInfo: {
        isForwarded: true,
        forwardingScore: 777,
        externalAdReply: {
          title: "POPKID Session Linker",
          body: "Generate Pairing Codes Instantly",
          thumbnailUrl: "https://i.ibb.co/fnQhM89/pair.png",
          sourceUrl: "https://popkidsessgenerator.onrender.com",
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m });

    await m.React("✅");
  } catch (err) {
    console.error("PAIR COMMAND ERROR:", err.message);
    await m.reply("❌ *An error occurred while fetching the pair code.*");
    await m.React("❌");
  }
};

export default pairCommand;
