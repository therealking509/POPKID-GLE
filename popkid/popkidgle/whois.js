// kenyan coder/whois.js
import config from '../../config.cjs';
import { fetchProfilePictureUrl } from '@whiskeysockets/baileys';

const msgCountStore = new Map();

const whois = async (m, sock) => {
  const prefix = config.PREFIX;
  const body = m.body || '';
  const cmd = body.startsWith(prefix) ? body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (cmd !== 'whois') return;

  const target = m.isGroup && m.mentionedJid?.length
    ? m.mentionedJid[0]
    : m.quoted?.participant || m.quoted?.sender || m.sender;

  try {
    const pp = await sock.profilePictureUrl(target, 'image').catch(() => null);
    const name = await sock.getName(target);
    const status = await sock.fetchStatus(target).catch(() => null);
    const msgCount = msgCountStore.get(target) || 0;
    const rank = msgCount >= 1000 ? "💎 Elite"
              : msgCount >= 500 ? "🔥 Pro"
              : msgCount >= 100 ? "📈 Active"
              : "🥱 Rookie";

    let text = `🧠 *Popkid WHOIS Result*\n\n`;
    text += `🏷️ *Name:* ${name || 'N/A'}\n`;
    text += `📱 *Number:* ${target.split('@')[0]}\n`;
    text += `📄 *Bio:* ${status?.status || 'No status set'}\n`;
    text += `🕒 *Last Updated:* ${status?.setAt ? new Date(status.setAt).toLocaleString() : 'N/A'}\n`;
    text += `📊 *Messages Sent:* ${msgCount}\n`;
    text += `🏆 *Activity Rank:* ${rank}\n`;

    if (m.isGroup) {
      const meta = await sock.groupMetadata(m.chat);
      const userMeta = meta.participants.find(p => p.id === target);
      if (userMeta?.admin) {
        text += `👮 *Role:* ${userMeta.admin === 'admin' ? 'Admin' : 'Super Admin'}\n`;
      }
    }

    if (pp) {
      await sock.sendMessage(m.chat, {
        image: { url: pp },
        caption: text
      }, { quoted: m });
    } else {
      await sock.sendMessage(m.chat, {
        text
      }, { quoted: m });
    }

  } catch (err) {
    console.error('WHOIS ERROR:', err);
    await sock.sendMessage(m.chat, {
      text: '❌ Could not fetch user info. They may be blocked or unknown.',
    }, { quoted: m });
  }
};

export default whois;
