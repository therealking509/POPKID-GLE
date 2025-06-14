import config from '../../config.cjs';

const menu = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === 'menu2') {
    const start = Date.now();
    await m.React('💻');

    let profilePictureUrl = 'https://files.catbox.moe/kiy0hl.jpg';
    try {
      const pp = await sock.profilePictureUrl(m.sender, 'image');
      if (pp) profilePictureUrl = pp;
    } catch {}

    const responseTime = ((Date.now() - start) / 1000).toFixed(2);
    const uptime = `${Math.floor(process.uptime() / 60)} min ${Math.floor(process.uptime() % 60)} sec`;

    const menuText = `
╭━━〔 𝗣𝗢𝗣𝗞𝗜𝗗-𝗫𝗠𝗗 𝗠𝗔𝗜𝗡 𝗠𝗘𝗡𝗨 〕━━╮
┃ ⚙️  *Speed:* ${responseTime}s
┃ 🔋 *Uptime:* ${uptime}
┃ 🧑‍💻 *Owner:* ${config.OWNER_NAME}
┃ 🌐 *Version:* 7.1.0
╰━━━━━━━━━━━━━━━━━━━━━━━╯

┌─〔 🛠️ 𝗦𝗬𝗦𝗧𝗘𝗠 〕
│• ${prefix}menu
│• ${prefix}alive
│• ${prefix}ping
│• ${prefix}owner
└─────────────

┌─〔 👑 𝗢𝗪𝗡𝗘𝗥 𝗧𝗢𝗢𝗟𝗦 〕
│• ${prefix}block / unblock
│• ${prefix}join / leave
│• ${prefix}autolikestatus
│• ${prefix}autobio
│• ${prefix}setppbot
│• ${prefix}setnamebot
│• ${prefix}setstatus
└─────────────

┌─〔 🤖 𝗔𝗜 / 𝗚𝗣𝗧 〕
│• ${prefix}ai / gpt
│• ${prefix}dalle
│• ${prefix}chatbot
│• ${prefix}bug / report
└─────────────

┌─〔 📥 𝗠𝗘𝗗𝗜𝗔 〕
│• ${prefix}play / video
│• ${prefix}gimage / attp
└─────────────

┌─〔 🔎 𝗦𝗘𝗔𝗥𝗖𝗛 〕
│• ${prefix}google / lyrics
│• ${prefix}imdb / mediafire
│• ${prefix}facebook / instagram / tiktok
└─────────────

┌─〔 🎭 𝗙𝗨𝗡 / 𝗨𝗧𝗜𝗟𝗦 〕
│• ${prefix}getpp
│• ${prefix}url
└─────────────

╭━━〔 📣 𝗣𝗢𝗣𝗞𝗜𝗗 𝗕𝗢𝗧𝗪𝗔𝗥𝗘 〕━━╮
┃ 💬  Dev: *Popkid-Xmd*
┃ 🛠  Framework: *Baileys*
┃ 🛰  Source: github.com/PopkidOfficial
╰━━━━━━━━━━━━━━━━━━━━━━━╯
    `.trim();

    await sock.sendMessage(m.from, {
      image: { url: profilePictureUrl },
      caption: menuText,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: "Popkid-Xmd",
          newsletterJid: "120363290715861418@newsletter",
        },
        externalAdReply: {
          title: `${config.BOT_NAME} | Main Menu`,
          body: `By ${config.OWNER_NAME}`,
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
