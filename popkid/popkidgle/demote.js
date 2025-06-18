import config from '../config.cjs';

const demote = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (cmd === 'demote') {
    if (!m.isGroup) return m.reply('🚫 *This command works only in groups.*');

    const metadata = await Matrix.groupMetadata(m.from);
    const groupAdmins = metadata.participants.filter(p => p.admin).map(p => p.id);
    const isBotAdmin = groupAdmins.includes(Matrix.user.id.split(':')[0]);
    const isUserAdmin = groupAdmins.includes(m.sender);

    if (!isUserAdmin) return m.reply('❌ *Only group admins can use this command.*');
    if (!isBotAdmin) return m.reply('❌ *I need to be an admin to demote someone.*');

    const mentioned = m.mentionedJid?.[0] || m.quoted?.sender;
    if (!mentioned) return m.reply('⚠️ *Mention or reply to someone to demote.*');

    await m.React('⚠️');
    await Matrix.groupParticipantsUpdate(m.from, [mentioned], 'demote');

    const response = `
╭───⌜ *⚠️ DEMOTION NOTICE* ⌟───╮
│
│ ⛔ @${mentioned.split('@')[0]} has been
│     *removed from admin role.* 💢
│
╰──────────────────────────────╯`;

    await Matrix.sendMessage(m.from, {
      text: response.trim(),
      contextInfo: {
        mentionedJid: [mentioned],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363290715861418@newsletter',
          newsletterName: "Popkid",
          serverMessageId: 143
        }
      }
    }, { quoted: m });
  }
};

export default demote;
