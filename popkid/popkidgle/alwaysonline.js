import config from '../../config.cjs';

const alwaysonlineCommand = async (m, Matrix) => {
  const botNumber = await Matrix.decodeJid(Matrix.user.id);
  const isCreator = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd !== 'alwaysonline') return;
  if (!isCreator) return m.reply('🚫 *OWNER ONLY COMMAND*');

  let statusText;
  const forwardedHeader = `╭───『 *📢 POPKID BOT NEWSLETTER* 』───⬣`;

  if (text === 'on') {
    config.ALWAYS_ONLINE = true;
    statusText = `
${forwardedHeader}
│
│  📶 *Always Online:* ✅ ENABLED
│  🟢 Bot will now stay connected 24/7.
│
╰──────────────⭑`.trim();
  } else if (text === 'off') {
    config.ALWAYS_ONLINE = false;
    statusText = `
${forwardedHeader}
│
│  📶 *Always Online:* ❌ DISABLED
│  🔴 Bot may now disconnect when idle.
│
╰──────────────⭑`.trim();
  } else {
    statusText = `
${forwardedHeader}
│
│  🛠️ *Usage:*
│  ┌・\`${prefix}alwaysonline on\`
│  └・\`${prefix}alwaysonline off\`
│
╰──────────────⭑`.trim();
  }

  try {
    const profilePictureUrl = await Matrix.profilePictureUrl(botNumber, 'image').catch(() => 'https://i.ibb.co/Y3q0kJv/default-pfp.png');

    await Matrix.sendMessage(m.from, {
      image: { url: profilePictureUrl },
      caption: statusText,
      contextInfo: {
        forwardingScore: 5,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: "Popkid-Xmd",
          newsletterJid: "120363290715861418@newsletter"
        }
      }
    }, { quoted: m });

  } catch (err) {
    console.error("[alwaysonline error]", err);
    await Matrix.sendMessage(m.from, {
      text: '⚠️ Error while updating always online status.'
    }, { quoted: m });
  }
};

export default alwaysonlineCommand;
