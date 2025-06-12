import config from '../../config.cjs';

const menu = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "popkidmenu") {
    const start = Date.now();
    await m.React('💻');
    const responseTime = (Date.now() - start) / 1000;

    let profilePictureUrl = 'https://i.imgur.com/EJf0JxA.jpeg';
    try {
      const pp = await sock.profilePictureUrl(m.sender, 'image');
      if (pp) profilePictureUrl = pp;
    } catch {}

    const menuText = `
╔══════════════════════╗
║ 💻 𝗣𝗢𝗣𝗞𝗜𝗗-𝗫𝗠𝗗 [𝕳𝖆𝖈𝖐𝖊𝖗 𝕸𝖔𝖉𝖊] 💻
╠══════════════════════╣
║ ⚡ Speed: ${responseTime.toFixed(2)}s
║ 🧬 Version: 7.1.0
║ 👤 Owner: ${config.OWNER_NAME}
╚══════════════════════╝

🧠 GPT/AI • 🎧 Media • 🔍 Search • 🛠️ Tools
Use commands like:
> ${prefix}ai | ${prefix}play | ${prefix}google

☠️ SYSTEM TOOLS
> ${prefix}ping — Latency Test
> ${prefix}uptime — Bot Uptime
> ${prefix}alive — Is bot running?

⚔️ ADMIN PANEL
> ${prefix}block, ${prefix}unblock, ${prefix}setstatus

🤖 Chat: ${config.CHAT_BOT ? "🟢 ON" : "🔴 OFF"}
💬 Mode: ${config.MODE}
    `.trim();

    await sock.sendMessage(m.from, {
      image: { url: profilePictureUrl },
      caption: menuText,
      footer: '💻 Popkid-XMD Hacker Menu',
      templateButtons: [
        { index: 1, quickReplyButton: { displayText: '⚡ Ping', id: `${prefix}ping` } },
        { index: 2, quickReplyButton: { displayText: '🕒 Uptime', id: `${prefix}uptime` } },
        { index: 3, quickReplyButton: { displayText: '🧪 Alive', id: `${prefix}alive` } },
      ],
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
          title: `⚙️ ${config.BOT_NAME} Menu`,
          body: `Secure | Fast | Hacker Styled`,
          thumbnailUrl: profilePictureUrl,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: 'https://github.com/PopkidOfficial'
        }
      }
    }, { quoted: m });
  }
};

export default menu;
