// popkid/whois.js
import config from '../../config.cjs';

const msgCountStore = new Map();

const whois = async (m, sock) => {
  const prefix = config.PREFIX || '.';
  const body = m.body || '';
  const cmd = body.startsWith(prefix)
    ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase()
    : '';

  // 🔎 kenyan kid
  if (cmd !== 'whois') return;

  try {
    await m.React('🔍');

    const target = m.isGroup
      ? m.mentionedJid?.[0] || m.quoted?.participant || m.quoted?.sender || m.sender
      : m.quoted?.sender || m.sender;

    const name = await sock.getName(target);
    const statusObj = await sock.fetchStatus(target).catch(() => null);
    const profilePic = await sock.profilePictureUrl(target, 'image').catch(() => null);
    const number = target.split('@')[0];
    const status = statusObj?.status || 'No bio set';
    const updated = statusObj?.setAt
      ? new Date(statusObj.setAt).toLocaleString()
      : 'N/A';
    const msgCount = msgCountStore.get(target) || 0;

    const rank = msgCount >= 1000 ? "💎 Elite"
              : msgCount >= 500 ? "🔥 Pro"
              : msgCount >= 100 ? "📈 Active"
              : "🥱 Rookie";

    let role = '';
    if (m.isGroup) {
      const meta = await sock.groupMetadata(m.chat);
      const userMeta = meta.participants.find(p => p.id === target);
      if (userMeta?.admin) {
        role = userMeta.admin === 'admin' ? '👮 Admin' : '👑 Super Admin';
      }
    }

    const caption = `🧠 *Popkid WHOIS Result*\n\n` +
      `🏷️ *Name:* ${name}\n` +
      `📱 *Number:* ${number}\n` +
      `📄 *Bio:* ${status}\n` +
      `🕒 *Updated:* ${updated}\n` +
      `📊 *Messages Sent:* ${msgCount}\n` +
      `🏆 *Rank:* ${rank}\n` +
      (role ? `${role}\n` : '') +
      `\n_ℹ️ Powered by Popkid GLE Bot_`;

    if (profilePic) {
      await sock.sendMessage(m.chat, {
        image: { url: profilePic },
        caption
      }, { quoted: m });
    } else {
      await sock.sendMessage(m.chat, {
        text: caption
      }, { quoted: m });
    }

  } catch (err) {
    console.error('[WHOIS ERROR]', err);
    await sock.sendMessage(m.chat, {
      text: '❌ Could not fetch WHOIS info.',
    }, { quoted: m });
  }
};

export default whois;

// 🚀 This line runs the function automatically!
export const run = (m, sock) => whois(m, sock);
