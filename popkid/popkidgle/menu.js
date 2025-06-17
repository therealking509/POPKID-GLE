import config from '../../config.cjs';

const menu = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "menu") {
    const start = Date.now();
    await m.React('🤖');
    const responseTime = (Date.now() - start) / 1000;

    let profilePictureUrl = 'https://files.catbox.moe/kiy0hl.jpg';
    try {
      const pp = await sock.profilePictureUrl(m.sender, 'image');
      if (pp) profilePictureUrl = pp;
    } catch {}

    const menuText = `
╭━━━━━━〔 💠 *${config.BOT_NAME} SYSTEM MENU* 💠 〕━━━━━━╮
┃
┃ 👤 User: @${m.sender.split('@')[0]}
┃ 👑 Owner: ${config.OWNER_NAME}
┃ ⚙️ Speed: ${responseTime.toFixed(2)}s
┃ 📦 Version: 7.1.0
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

╭─〔 ⚙️ SYSTEM 〕─╮
┃ ▸ ${prefix}menu
┃ ▸ ${prefix}alive
┃ ▸ ${prefix}ping
┃ ▸ ${prefix}owner
╰────────────────╯

╭─〔 👑 OWNER PANEL 〕─╮
┃ ▸ ${prefix}block / unblock
┃ ▸ ${prefix}join / leave
┃ ▸ ${prefix}autolikestatus
┃ ▸ ${prefix}autobio
┃ ▸ ${prefix}setppbot
┃ ▸ ${prefix}setstatus
┃ ▸ ${prefix}setnamebot
╰────────────────────╯

╭─〔 🧠 GPT & AI ZONE 〕─╮
┃ ▸ ${prefix}ai
┃ ▸ ${prefix}gpt
┃ ▸ ${prefix}dalle
┃ ▸ ${prefix}chatbot
┃ ▸ ${prefix}bug
┃ ▸ ${prefix}report
╰─────────────────────╯

╭─〔 🎧 MEDIA / DOWNLOADS 〕─╮
┃ ▸ ${prefix}play
┃ ▸ ${prefix}video
┃ ▸ ${prefix}gimage
┃ ▸ ${prefix}attp
╰──────────────────────────╯

╭─〔 🔍 SEARCH MODULES 〕─╮
┃ ▸ ${prefix}google
┃ ▸ ${prefix}lyrics
┃ ▸ ${prefix}imdb
┃ ▸ ${prefix}mediafire
┃ ▸ ${prefix}facebook
┃ ▸ ${prefix}instagram
┃ ▸ ${prefix}tiktok
╰────────────────────────╯

╭─〔 🛠️ UTILITIES 〕─╮
┃ ▸ ${prefix}getpp
┃ ▸ ${prefix}url
╰────────────────────╯

╭─〔 📊 STATUS 〕─╮
┃ ▸ Uptime: ⏳ Coming Soon...
┃ ▸ Powered by: *Popkid-Xmd*
╰─────────────────╯
    `.trim();

    await sock.sendMessage(m.from, {
      image: { url: profilePictureUrl },
      caption: menuText,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: 'Popkid-Xmd',
          newsletterJid: '120363290715861418@newsletter'
        },
        externalAdReply: {
          title: `${config.BOT_NAME} | Main Console`,
          body: `Built with 💻 by ${config.OWNER_NAME}`,
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
