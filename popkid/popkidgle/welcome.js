import config from '../../config.cjs';

const gcEvent = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === 'welcome') {
    if (!m.isGroup) return m.reply('🚫 *This command only works in group chats!*');

    // Instant reply to show it's working
    await m.reply('⏳ Processing your request...');

    let menuText = '';
    if (text === 'on') {
      config.WELCOME = true;
      menuText = `
╭━━━〔  🔔 *WELCOME SYSTEM ENABLED* 🔔 〕━━━╮
✨ *Welcome & Goodbye* system activated.
👋 Members joining/leaving will trigger a message.
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
    } else if (text === 'off') {
      config.WELCOME = false;
      menuText = `
╭━━━〔  🔕 *WELCOME SYSTEM DISABLED* 🔕 〕━━━╮
🚫 No welcome/goodbye messages will be shown.
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
    } else {
      menuText = `
╭──〔 📘 *WELCOME SYSTEM HELP* 〕──╮
🟢 \`${prefix}welcome on\` - Enable
🔴 \`${prefix}welcome off\` - Disable
📌 Group only.
╰────────────────────────────╯`;
    }

    // Try to get profile pic, fallback image if not available
    let profilePictureUrl = 'https://files.catbox.moe/ia6oln.jpg';
    try {
      profilePictureUrl = await Matrix.profilePictureUrl(m.chat, 'image');
    } catch {}

    // Send the styled image message
    await Matrix.sendMessage(m.from, {
      image: { url: profilePictureUrl },
      caption: menuText.trim(),
      contextInfo: {
        forwardingScore: 5,
        isForwarded: true,
        externalAdReply: {
          title: "👑 Popkid-Xmd Bot",
          body: "Welcome feature toggled!",
          thumbnailUrl: profilePictureUrl,
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: true,
          sourceUrl: "https://github.com/popkid-xmd"
        },
        forwardedNewsletterMessageInfo: {
          newsletterName: "Popkid-Xmd",
          newsletterJid: "120363290715861418@newsletter",
        },
      }
    }, { quoted: m });
  }
};

export default gcEvent;
