//popkid whois.js

import config from '../../config.cjs';
import { fetchProfilePictureUrl } from '@whiskeysockets/baileys';

const msgCountStore = new Map();

const whois = async (m, sock) => {
  const sender = m.isGroup && m.mentionedJid?.length
    ? m.mentionedJid[0]
    : m.quoted?.participant || m.sender;

  const name = await sock.getName(sender);
  const number = sender.split('@')[0];

  const menuText = `👤 *Popkid WHOIS Scanner*\n\n` +
    `• 1. Full Profile Info\n` +
    `• 2. Group Join Info\n` +
    `• 3. Rank & Activity\n` +
    `• 4. Mutual Groups\n\n` +
    `_Reply with a number (1–4)_`;

  const menuMsg = await sock.sendMessage(m.chat, { text: menuText }, { quoted: m });

  const msgID = menuMsg.key.id;

  sock.ev.once('messages.upsert', async ({ messages }) => {
    const reply = messages[0];
    const selection = reply.message?.conversation?.trim();

    if (reply?.key?.remoteJid !== m.chat) return;
    if (!['1', '2', '3', '4'].includes(selection)) return;

    try {
      let response = '';
      const status = await sock.fetchStatus(sender).catch(() => null);
      const pp = await sock.profilePictureUrl(sender, 'image').catch(() => null);
      const msgCount = msgCountStore.get(sender) || 0;

      switch (selection) {
        case '1':
          response += `🧑 *Profile Info*\n`;
          response += `• Name: ${name}\n`;
          response += `• Number: ${number}\n`;
          response += `• Status: ${status?.status || 'None'}\n`;
          response += `• Last Updated: ${status?.setAt ? new Date(status.setAt).toLocaleString() : 'N/A'}\n`;
          break;

        case '2':
          const groupMeta = await sock.groupMetadata(m.chat);
          const userMeta = groupMeta.participants.find(p => p.id === sender);
          if (userMeta?.admin) response += `• Role: ${userMeta.admin === 'admin' ? 'Admin' : 'Super Admin'}\n`;
          if (userMeta?.joinTimestamp) {
            const joined = new Date(userMeta.joinTimestamp * 1000);
            response += `• Joined On: ${joined.toLocaleDateString()} ${joined.toLocaleTimeString()}`;
          } else {
            response = '⛔ Could not find group join info.';
          }
          break;

        case '3':
          const rank = msgCount >= 1000 ? "💎 Elite"
                    : msgCount >= 500 ? "🔥 Pro"
                    : msgCount >= 100 ? "📈 Active"
                    : "🥱 Rookie";
          response += `📊 *Activity Rank*\n`;
          response += `• Messages: ${msgCount}\n`;
          response += `• Rank: ${rank}`;
          break;

        case '4':
          const groups = await sock.groupFetchAllParticipating();
          const mutual = Object.values(groups).filter(g => g.participants.some(p => p.id === sender));
          response += `👥 *Mutual Groups:* ${mutual.length}\n`;
          if (mutual.length > 0) {
            response += mutual.slice(0, 5).map((g, i) => `  ${i + 1}. ${g.subject}`).join('\n');
            if (mutual.length > 5) response += `\n...and ${mutual.length - 5} more`;
          }
          break;
      }

      if (selection === '1' && pp) {
        await sock.sendMessage(m.chat, { image: { url: pp }, caption: response }, { quoted: reply });
      } else {
        await sock.sendMessage(m.chat, { text: response }, { quoted: reply });
      }

    } catch (e) {
      console.log(e);
      await sock.sendMessage(m.chat, { text: '❌ Error fetching data.' }, { quoted: reply });
    }
  });
};

export default whois;
