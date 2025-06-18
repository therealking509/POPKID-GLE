import config from '../../config.cjs';
import { format } from 'date-fns';
import { getTimeZone } from '../../lib/functions.js'; // If you have a timezone helper

const groupinfo = async (m, gss) => {
  try {
    const cmd = m.body.slice(config.PREFIX.length).split(' ')[0].toLowerCase();

    if (cmd !== 'groupinfo' && cmd !== 'gcinfo') return;
    if (!m.isGroup) return m.reply('❌ This command can only be used in a group.');

    const metadata = await gss.groupMetadata(m.from);
    const participants = metadata.participants;
    const admins = participants.filter(p => p.admin);
    const owner = metadata.owner || metadata.participants.find(p => p.admin === 'superadmin')?.id;
    const description = metadata.desc || 'No description set.';
    const creationDate = new Date(metadata.creation * 1000);
    const groupPP = await gss.profilePictureUrl(m.from, 'image').catch(() => null);

    const msg = `
┏━━━〔 🧾 *Group Information* 〕━━━┓
┃
┃ 🏷️ *Name:* ${metadata.subject}
┃ 🆔 *ID:* ${m.from}
┃ 👑 *Owner:* @${owner?.split('@')[0]}
┃ 📆 *Created:* ${format(creationDate, 'PPpp')}
┃ 👥 *Members:* ${participants.length}
┃ 🛡 *Admins:* ${admins.length}
┃ 📝 *Description:* 
┃ ${description.split('\n').map(d => `┃ ${d}`).join('\n')}
┃
┗━━━━━━━━━━━━━━━━━━━━┛
`.trim();

    await gss.sendMessage(m.from, {
      image: groupPP || null,
      caption: msg,
      mentions: [owner],
      contextInfo: {
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363290715861418@newsletter',
          newsletterName: 'Popkid-Xmd'
        }
      }
    });
  } catch (err) {
    console.error('GroupInfo Error:', err);
    m.reply('❌ An error occurred while fetching group info.');
  }
};

export default groupinfo;
