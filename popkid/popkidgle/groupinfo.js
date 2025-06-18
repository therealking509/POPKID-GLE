import config from '../config.cjs';
import { format } from 'date-fns-tz';

const groupinfo = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (cmd === 'groupinfo') {
    if (!m.isGroup) return m.reply('👥 This command only works in groups.');

    const metadata = await Matrix.groupMetadata(m.from);
    const participants = metadata.participants;
    const groupAdmins = participants.filter(p => p.admin);
    const groupOwner = metadata.owner || groupAdmins[0]?.id || '';
    const memberCount = participants.length;
    const adminCount = groupAdmins.length;
    const creationDate = format(metadata.creation * 1000, 'dd MMM yyyy, HH:mm zzz', { timeZone: 'Africa/Nairobi' });

    await m.React('📊');

    const infoText = `
╭─⌜ *📢 GROUP INFORMATION* ⌟─╮
│
│ 🏷️ *Name:* ${metadata.subject}
│ 🆔 *ID:* ${m.from}
│ 👑 *Owner:* @${groupOwner.split('@')[0]}
│ 👥 *Members:* ${memberCount}
│ 🛡️ *Admins:* ${adminCount}
│ 🕒 *Created:* ${creationDate}
│ 🔒 *Restrict:* ${metadata.restrict ? 'Yes' : 'No'}
│ 🚫 *Announce Mode:* ${metadata.announce ? 'Admins Only' : 'Everyone'}
│ 📝 *Desc:* ${metadata.desc ? metadata.desc : 'No description set.'}
│
╰──────────────────────────╯
`;

    await Matrix.sendMessage(m.from, {
      text: infoText.trim(),
      contextInfo: {
        mentionedJid: [groupOwner],
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

export default groupinfo;
