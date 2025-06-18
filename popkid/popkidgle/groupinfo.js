import moment from 'moment-timezone';
import config from '../../config.cjs';

export const groupInfoCommand = async (m, sock) => {
  const newsletter = {
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363290715861418@newsletter',
      newsletterName: 'Popkid-Xmd',
      serverMessageId: m.id
    }
  };

  if (!m.isGroup) {
    return await sock.sendMessage(m.from, {
      text: `🚫 *This command only works in group chats!*`,
      ...newsletter
    }, { quoted: m });
  }

  const metadata = await sock.groupMetadata(m.from);
  const { id, subject, owner, participants, creation, desc } = metadata;

  const admins = participants.filter(p => p.admin !== null);
  const totalMembers = participants.length;
  const groupOwner = owner ? `@${owner.split('@')[0]}` : "Unknown";

  const createdAt = moment(creation * 1000).tz('Africa/Nairobi').format('MMMM Do YYYY, h:mm A');

  // Try fetching group profile picture
  let pfp;
  try {
    pfp = await sock.profilePictureUrl(m.from, 'image');
  } catch {
    pfp = 'https://i.imgur.com/5QnRk4y.png'; // fallback/default image
  }

  const caption = `
🏷️ *Group Name:* ${subject}
🆔 *ID:* ${id}
👑 *Owner:* ${groupOwner}
👥 *Members:* ${totalMembers}
🔰 *Admins:* ${admins.length}
🕰️ *Created:* ${createdAt}
📝 *Description:*
${desc?.toString().substring(0, 500) || '_No description set._'}
`.trim();

  await sock.sendMessage(m.from, {
    image: { url: pfp },
    caption,
    mentions: [owner],
    ...newsletter
  }, { quoted: m });
};
