import { serialize } from '../../lib/Serializer.js';
import config from '../../config.cjs';

const antilinkSettings = {}; // { groupId: { mode: 'off'|'delete'|'warn'|'kick', warnings: {} } }

const newsletter = {
  contextInfo: {
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363290715861418@newsletter',
      newsletterName: 'Popkid-Xmd',
      serverMessageId: '' + Math.floor(Math.random() * 9999),
    },
    isForwarded: true,
    forwardingScore: 100,
  }
};

export const handleAntilink = async (m, sock, logger, _isBotAdmins, _isAdmins, isCreator) => {
  const PREFIX = /^[\\/!#.]/;
  const isCOMMAND = (body) => PREFIX.test(body);
  const prefixMatch = isCOMMAND(m.body) ? m.body.match(PREFIX) : null;
  const prefix = prefixMatch ? prefixMatch[0] : '/';
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  // Admin checks
  let isBotAdmins = false;
  let isAdmins = false;

  if (m.isGroup) {
    try {
      const groupMetadata = await sock.groupMetadata(m.from);
      const groupAdmins = groupMetadata.participants
        .filter(p => p.admin !== null)
        .map(p => p.id);

      const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      isBotAdmins = groupAdmins.includes(botNumber);
      isAdmins = groupAdmins.includes(m.sender);
    } catch (err) {
      console.error('Failed to fetch group metadata:', err);
    }
  }

  // Init default
  if (!antilinkSettings[m.from]) {
    antilinkSettings[m.from] = { mode: 'off', warnings: {} };
  }

  const args = m.body.slice(prefix.length + cmd.length).trim().split(/\s+/);
  const mode = args[0]?.toLowerCase();

  if (cmd === 'antilink') {
    if (!m.isGroup) return sock.sendMessage(m.from, { text: '❗ This command is for groups only.' }, { quoted: m });
    if (!isBotAdmins) return sock.sendMessage(m.from, { text: '🤖 I need to be *admin* to enforce antilink.' }, { quoted: m });
    if (!isAdmins && !isCreator) return sock.sendMessage(m.from, { text: '🛂 Only *group admins* can use this command.' }, { quoted: m });

    if (!['off', 'delete', 'warn', 'kick'].includes(mode)) {
      return sock.sendMessage(m.from, {
        text:
`┏━━━『 🛡️ *Antilink Configuration* 🛡️ 』━━━┓
┃ 
┃ 🟢 *Current Mode:*  ${antilinkSettings[m.from].mode.toUpperCase()}
┃ 
┃ ⚙️ *Available Modes:*
┃ 
┃ ┌───⭓
┃ │ ${prefix}antilink off     ❌ Disable
┃ │ ${prefix}antilink delete  🗑️ Delete links
┃ │ ${prefix}antilink warn    ⚠️ Warn sender
┃ │ ${prefix}antilink kick    🚫 Kick after 3 warns
┃ └───────────────⭓
┃
┃ 🔄 Type a mode to change it
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛`,
        ...newsletter
      }, { quoted: m });
    }

    antilinkSettings[m.from].mode = mode;
    return sock.sendMessage(m.from, {
      text: `✅ *Antilink mode set to:* ${mode.toUpperCase()}`,
      ...newsletter
    }, { quoted: m });
  }

  // Detect link
  const hasLink = /(https?:\/\/[^\s]+)/i.test(m.body);
  if (!hasLink || antilinkSettings[m.from].mode === 'off') return;

  // Exclude group link
  const gclink = `https://chat.whatsapp.com/${await sock.groupInviteCode(m.from)}`;
  const isGcLink = new RegExp(gclink, 'i').test(m.body);
  if (isGcLink) return;

  if (isAdmins || isCreator) {
    return sock.sendMessage(m.from, {
      text: `👮 *Link sent by admin.* No action taken.`,
      ...newsletter
    });
  }

  if (!isBotAdmins) return;

  await sock.sendMessage(m.from, { delete: m.key });

  const modeSet = antilinkSettings[m.from].mode;
  if (modeSet === 'delete') {
    return sock.sendMessage(m.from, {
      text: `🗑️ *Link deleted.*`,
      ...newsletter
    });
  }

  if (modeSet === 'warn' || modeSet === 'kick') {
    const warnData = antilinkSettings[m.from].warnings;
    if (!warnData[m.sender]) warnData[m.sender] = 0;
    warnData[m.sender]++;

    const userWarn = warnData[m.sender];
    const maxWarn = config.ANTILINK_WARNINGS || 3;

    if (userWarn >= maxWarn && modeSet === 'kick') {
      delete warnData[m.sender];
      await sock.groupParticipantsUpdate(m.from, [m.sender], 'remove');
      return sock.sendMessage(m.from, {
        text: `🚫 *@${m.sender.split('@')[0]}* was removed after *${maxWarn}* warnings.`,
        mentions: [m.sender],
        ...newsletter
      });
    } else {
      return sock.sendMessage(m.from, {
        text: `⚠️ *@${m.sender.split('@')[0]}*, this is warning ${userWarn}/${maxWarn}!\n*Links are not allowed.*`,
        mentions: [m.sender],
        ...newsletter
      }, { quoted: m });
    }
  }
};
