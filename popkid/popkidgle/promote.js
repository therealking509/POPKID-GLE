import config from '../../config.cjs';

export const promoteRevoke = async (m, sock, isCreator) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  const newsletter = {
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363290715861418@newsletter',
      newsletterName: 'Popkid-Xmd',
      serverMessageId: m.id
    }
  };

  const image = { url: 'https://files.catbox.moe/kiy0hl.jpg' }; // ⬅️ Use your actual image URL here

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
      caption: `🤖 *Bot must be admin to manage group roles!*`,
      ...newsletter
    }, { quoted: m });
  }

  if (!groupAdmins.includes(m.sender) && !isCreator) {
    return await sock.sendMessage(m.from, {
      image,
      caption: `🛑 *Only group admins or the bot owner can use this command!*`,
      ...newsletter
    }, { quoted: m });
  }

  const mentions = m.mentions || [];
  if (mentions.length === 0) {
    return await sock.sendMessage(m.from, {
      image,
      caption: `📘 *Usage Instructions:*\n\n➤ *${prefix}promote @user* – Make someone admin\n➤ *${prefix}revoke @user* – Remove someone from admin\n\n🧠 Tag the user you want to promote or demote.`,
      ...newsletter
    }, { quoted: m });
  }

  const target = mentions[0];
  const username = `@${target.split('@')[0]}`;

  if (cmd === 'promote') {
    await sock.groupParticipantsUpdate(m.from, [target], 'promote');
    return await sock.sendMessage(m.from, {
      image,
      caption: `🛡️ *Promotion Successful!*\n\n🎉 ${username} has been *granted admin privileges!*\n\n💼 Please use your powers wisely.`,
      mentions: [target],
      ...newsletter
    }, { quoted: m });
  }

  if (cmd === 'revoke') {
    await sock.groupParticipantsUpdate(m.from, [target], 'demote');
    return await sock.sendMessage(m.from, {
      image,
      caption: `⚠️ *Demotion Successful!*\n\n🔻 ${username} has been *removed from admin status.*\n\n✅ Regular member now.`,
      mentions: [target],
      ...newsletter
    }, { quoted: m });
  }
};
