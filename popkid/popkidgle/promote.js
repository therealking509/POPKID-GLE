import config from '../config.cjs';

const promote = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (cmd === 'promote') {
    if (!m.isGroup) return m.reply('🚫 *This command works only in groups.*');

    const metadata = await Matrix.groupMetadata(m.from);
    const groupAdmins = metadata.participants.filter(p => p.admin).map(p => p.id);
    const isBotAdmin = groupAdmins.includes(Matrix.user.id.split(':')[0]);
    const isUserAdmin = groupAdmins.includes(m.sender);

    if (!isUserAdmin) return m.reply('❌ *Only group admins can use this command.*');
    if (!isBotAdmin) return m.reply('❌ *I need to be an admin to promote someone.*');

    const mentioned = m.mentionedJid?.[0] || m.quoted?.sender;
    if (!mentioned) return m.reply('⚠️ *Mention or reply to someone to promote.*');

    await m.React('👑');
    await Matrix.groupParticipantsUpdate(m.from, [mentioned], 'promote');

    const response = `
╭───⌜ *👑 PROMOTION GRANTED* ⌟───╮
│
│ 🎉 @${mentioned.split('@')[0]} has been
│     *successfully promoted* to admin! 🚀
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

export default promote;
