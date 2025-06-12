import config from '../../config.cjs';

const menu = async (m, sock) => {
  const prefix = config.PREFIX;
  const rawCmd = (
    m.message?.buttonsResponseMessage?.selectedButtonId ||
    m.message?.templateButtonReplyMessage?.selectedId ||
    m.body || ''
  ).trim();

  const cmd = rawCmd.startsWith(prefix) ? rawCmd.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = rawCmd.slice(prefix.length + cmd.length).trim();

  if (cmd === "popkidmenu") {
    const start = new Date().getTime();
    await m.react('💻');
    const end = new Date().getTime();
    const responseTime = (end - start) / 1000;

    let profilePictureUrl = 'https://i.ibb.co/HhMTvSP/hack-menu.jpg'; // Hacker-style fallback image
    try {
      const pp = await sock.profilePictureUrl(m.sender, 'image');
      if (pp) profilePictureUrl = pp;
    } catch (e) {
      console.error("PP fetch failed:", e);
    }

    const menuText = `
┏━━━━━━━━━━━━━━━━━━━┓
┃   👾  𝐏𝐎𝐏𝐊𝐈𝐃-𝐗𝐌𝐃 𝐁𝐎𝐓  👾
┗━━━━━━━━━━━━━━━━━━━┛

🔹 ᴠᴇʀꜱɪᴏɴ : 7.1.0
🔹 ʀᴇꜱᴘᴏɴꜱᴇ : ${responseTime}s
🔹 ᴍᴏᴅᴇ : ${config.MODE.toUpperCase()}
🔹 ᴅᴇᴠ : 👨‍💻 POPKID

⚙️  *SYSTEM COMMANDS*:
│ ${prefix}menu
│ ${prefix}alive
│ ${prefix}owner
│ ${prefix}ping
│ ${prefix}uptime

👑  *OWNER CONTROLS*:
│ ${prefix}block
│ ${prefix}unblock
│ ${prefix}anticall
│ ${prefix}autobio
│ ${prefix}setppbot

🧠  *GPT/AI TOOLS*:
│ ${prefix}ai
│ ${prefix}gpt
│ ${prefix}dalle
│ ${prefix}chatbot

📤  *DOWNLOADERS*:
│ ${prefix}play
│ ${prefix}facebook
│ ${prefix}instagram
│ ${prefix}tiktok

🎭  *FUN / EXTRAS*:
│ ${prefix}attp
│ ${prefix}getpp
│ ${prefix}google
│ ${prefix}lyrics

🌐  *INFO / UTILS*:
│ ${prefix}report
│ ${prefix}bug
│ ${prefix}imdb

━━━━━━━━━━━━━━━━━━━━
🔐 ᴄᴜꜱᴛᴏᴍ ʙᴏᴛ ᴇɴɢɪɴᴇ ʙʏ ᴘᴏᴘᴋɪᴅ ☠️
`.trim();

    await sock.sendMessage(m.from, {
      image: { url: profilePictureUrl },
      caption: menuText,
      buttons: [
        { buttonId: `${prefix}ping`, buttonText: { displayText: '🛰️ Ping' }, type: 1 },
        { buttonId: `${prefix}uptime`, buttonText: { displayText: '⏱️ Uptime' }, type: 1 }
      ],
      footer: '👾 POPKID-XMD BOT 👾\n🔗 Powered by Popkid',
      headerType: 4,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
          title: '👾 POPKID-XMD BOT',
          body: 'Next-gen WhatsApp automation',
          thumbnailUrl: profilePictureUrl,
          sourceUrl: 'https://github.com/popkid-md',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m });
  }
};

export default menu;
