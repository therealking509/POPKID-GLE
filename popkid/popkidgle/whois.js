// popkidgle/whois.js
import config from '../../config.cjs';

const msgCountStore = new Map();

const whois = async (m, sock) => {
  const prefix = config.PREFIX || '.';
  const body = m.body || '';
  const cmd = body.startsWith(prefix)
    ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase()
    : '';

  if (cmd !== 'whois') return;

  try {
    await m.React('🔍');

    // ✅ Target detection (mention > reply > sender)
    const target = m.isGroup
      ? m.mentionedJid?.[0] || m.quoted?.participant || m.quoted?.sender || m.sender
      : m.quoted?.sender || m.sender;

    console.log('[WHOIS] Target:', target);

    // ✅ Name
    let name = await sock.getName(target).catch(() => null);
    if (!name) name = target.split('@')[0];

    // ✅ Status
    let status = 'No bio';
    let updated = 'N/A';
    try {
      const statusObj = await sock.fetchStatus(target);
      if (statusObj) {
        status = statusObj.status || 'No bio';
        updated = statusObj.setAt
          ? new Date(statusObj.setAt).toLocaleString()
          : 'N/A';
      }
    } catch (e) {
      console.warn('[WHOIS] Could not fetch status');
    }

    // ✅ Profile Pic
    let profilePic;
    try {
      profilePic = await sock.profilePictureUrl(target, 'image');
    } catch (e) {
      console.warn('[WHOIS] No profile picture found');
    }

    // ✅ Message Count
    const number = target.split('@')[0];
    const msgCount = msgCountStore.get(target) || 0;
    const rank = msgCount >= 1000 ? "💎 Elite"
              : msgCount >= 500 ? "🔥 Pro"
              : msgCount >= 100 ? "📈 Active"
              : "🥱 Rookie";

    // ✅ Group Role
    let role = '';
    if (m.isGroup) {
      const meta = await sock.groupMetadata(m.chat);
      const userMeta = meta.participants.find(p => p.id === target);
      if (userMeta?.admin) {
        role = userMeta.admin === 'admin' ? '👮 Admin' : '👑 Super Admin';
      }
    }

    // ✅ Response Text
    const caption = `🧠 *Popkid WHOIS Result*\n\n` +
      `🏷️ *Name:* ${name}\n` +
      `📱 *Number:* ${number}\n` +
      `📄 *Bio:* ${status}\n` +
      `🕒 *Updated:* ${updated}\n` +
      `📊 *Messages Sent:* ${msgCount}\n` +
      `🏆 *Rank:* ${rank}\n` +
      (role ? `${role}\n` : '') +
      `\n_ℹ️ Powered by Popkid GLE Bot_`;

    // ✅ Send Message
    if (profilePic) {
      await sock.sendMessage(m.chat, {
        image: { url: profilePic },
        caption
      }, { quoted: m });
    } else {
      await sock.sendMessage(m.chat, { text: caption }, { quoted: m });
    }

  } catch (err) {
    console.error('[WHOIS ERROR]', err);
    await sock.sendMessage(m.chat, {
      text: '❌ Failed to fetch WHOIS info. User may be unreachable or blocked.',
    }, { quoted: m });
  }
};

export default whois;
export const run = (m, sock) => whois(m, sock);
