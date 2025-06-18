import config from '../../config.cjs';

export const demoteCommand = async (m, sock, isCreator) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  const newsletter = {
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363290715861418@newsletter',
      newsletterName: 'Popkid-Xmd',
      serverMessageId: m.id
    }
  };

  const image = { url: 'https://files.catbox.moe/kiy0hl.jpg' }; // Replace with your custom image

  if (!m.isGroup) {
    return await sock.sendMessage(m.from, {
      image,
      caption: `🚫 *This command only works in group chats!*`,
      ...newsletter
    }, { quoted: m });
  }

  const metadata = await sock.groupMetadata(m.from);
  const groupAdmins = metadata.participants.filter(p => p.admin !== null).map(p => p.id);
  const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';

  if (!groupAdmins.includes(botNumber)) {
    return await sock.sendMessage(m.from, {
      image,
      caption: `🤖 *I need admin rights to demote someone.*`,
      ...newsletter
    }, { quoted: m });
  }

  if (!groupAdmins.includes(m.sender) && !isCreator) {
    return await sock.sendMessage(m.from, {
      image,
      caption: `⛔ *Only group admins or the bot owner can use this command.*`,
      ...newsletter
    }, { quoted: m });
  }

  const mentions = m.mentions || [];
  if (mentions.length === 0) {
    return await sock.sendMessage(m.from, {
      image,
      caption: `📘 *Usage:*  ${prefix}demote @user\n\n🔻 This will remove admin rights from the tagged user.`,
      ...newsletter
    }, { quoted: m });
  }

  const target = mentions[0];
  const username = `@${target.split('@')[0]}`;

  await sock.groupParticipantsUpdate(m.from, [target], 'demote');

  return await sock.sendMessage(m.from, {
    image,
    caption: `⚠️ *Demotion Successful!*\n\n🔻 ${username} has been removed from *admin* status.`,
    mentions: [target],
    ...newsletter
  }, { quoted: m });
};
