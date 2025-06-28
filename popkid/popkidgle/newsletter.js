import config from '../config.cjs';

const newsletter = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (cmd === "newsletter") {
    const emojis = ['📰', '📣', '📨', '🔔', '🗞️', '📢'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    await m.React(emoji);

    const isNewsletter = m.from.endsWith('@newsletter');
    if (!isNewsletter) {
      return await Matrix.sendMessage(m.from, {
        text: `🚫 *Only available in a WhatsApp Channel (@newsletter).*`
      }, { quoted: m });
    }

    const now = new Date().toLocaleString();
    const channelId = m.from;

    // popkid gle
    const mainMessage = `
╭━━━[ 🌟 𝗡𝗘𝗪𝗦𝗟𝗘𝗧𝗧𝗘𝗥 𝗜𝗡𝗙𝗢 🌟 ]━━━╮
┃ 📛 *Channel ID:* 
┃ \`\`\`${channelId}\`\`\`
┃ 
┃ 🕒 *Executed on:* _${now}_
┃ 🔁 *Simulated forward from Popkid-Xmd*
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`;

    await Matrix.sendMessage(m.from, {
      text: mainMessage,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363420342566562@newsletter",
          newsletterName: "Popkid-Xmd 🧋",
          serverMessageId: 101
        }
      }
    }, { quoted: m });
  }
};

export default newsletter;
