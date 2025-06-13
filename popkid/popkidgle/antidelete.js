import fs from 'fs';
import config from '../../config.cjs';
import pkg from '@whiskeysockets/baileys';

const { proto, downloadContentFromMessage } = pkg;
const { PREFIX: prefix, ANTI_DELETE: antiDeleteGlobal } = config;

const demonContext = {
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: '120363290715861418@newsletter',
    newsletterName: 'popkid recoveries',
    serverMessageId: 143
  }
};

// 📦 AntiDelete Class
class DemonAntiDelete {
  constructor() {
    this.enabled = false;
    this.messageCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanExpiredMessages(), this.cacheExpiry);
  }

  cleanExpiredMessages() {
    const now = Date.now();
    for (const [key, msg] of this.messageCache.entries()) {
      if (now - msg.timestamp > this.cacheExpiry) {
        this.messageCache.delete(key);
      }
    }
  }

  formatTime(timestamp) {
    return new Date(timestamp).toLocaleString('en-PK', {
      timeZone: 'Asia/Karachi',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }) + ' (PKT)';
  }
}

const demonDelete = new DemonAntiDelete();
const statusPath = './demon_antidelete.json';

// 📂 Load and Setup Status
let statusData = fs.existsSync(statusPath)
  ? JSON.parse(fs.readFileSync(statusPath))
  : { chats: {} };

if (!statusData.chats) statusData.chats = {};
if (antiDeleteGlobal) demonDelete.enabled = true;

// ⚔️ AntiDelete Main Handler
const AntiDelete = async (m, Matrix) => {
  const chatId = m.from;

  const formatJid = (jid) => jid?.replace(/@s\.whatsapp\.net|@g\.us/g, '') || 'Unknown';

  const getChatInfo = async (jid) => {
    if (!jid) return { name: 'Unknown Chat', isGroup: false };
    if (jid.includes('@g.us')) {
      try {
        const meta = await Matrix.groupMetadata(jid);
        return { name: meta?.subject || 'popkid xmd', isGroup: true };
      } catch {
        return { name: 'popkid xmd', isGroup: true };
      }
    }
    return { name: 'Private Mission', isGroup: false };
  };

  // 🔘 Handle AntiDelete On/Off Command
  const command = m.body.toLowerCase();
  if ([`${prefix}antidelete on`, `${prefix}antidelete off`].includes(command)) {
    const isOn = command.endsWith('on');
    statusData.chats[chatId] = isOn;
    fs.writeFileSync(statusPath, JSON.stringify(statusData, null, 2));
    demonDelete.enabled = isOn;
    if (!isOn) demonDelete.messageCache.clear();

    const response = isOn
      ? {
          text: `🛡️ *popkid Xmd Anti-Delete Activated!*\n\n• Status: ✅ Enabled\n• Cache: 🕒 5 minutes\n• Mode: 🌐 Global\n\n_Deleted messages will now rise from the shadows_\n\n━━━━━━⊱✿⊰━━━━━━\nᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴏᴘᴋɪᴅ xᴍᴅ`,
          contextInfo: demonContext
        }
      : {
          text: `⛔ *popkid Xmd Anti-Delete Deactivated!*\n\n• Status: ❌ Disabled\n\n_Message recovery disabled_\n\n━━━━━━⊱✿⊰━━━━━━\nᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴏᴘᴋɪᴅ`,
          contextInfo: demonContext
        };

    await Matrix.sendMessage(chatId, response, { quoted: m });
    await Matrix.sendReaction(chatId, m.key, '⚔️');
    return;
  }

  // 💾 Store Incoming Messages
  Matrix.ev.on('messages.upsert', async ({ messages }) => {
    if (!antiDeleteGlobal && !demonDelete.enabled) return;
    if (!messages?.length) return;

    for (const msg of messages) {
      if (msg.key.fromMe || !msg.message || msg.key.remoteJid === 'status@broadcast') continue;

      try {
        const content =
          msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          msg.message.imageMessage?.caption ||
          msg.message.videoMessage?.caption ||
          msg.message.documentMessage?.caption;

        let media = null,
          type = null,
          mimetype = null;

        const mediaTypes = ['image', 'video', 'audio', 'sticker', 'document'];

        for (const mediaType of mediaTypes) {
          const mediaMsg = msg.message[`${mediaType}Message`];
          if (mediaMsg) {
            try {
              const stream = await downloadContentFromMessage(mediaMsg, mediaType);
              const buffer = Buffer.concat(await streamToBuffer(stream));
              media = buffer;
              type = mediaType;
              mimetype = mediaMsg.mimetype;
              break;
            } catch {}
          }
        }

        // Handle voice/ptt
        if (msg.message.audioMessage?.ptt) {
          try {
            const stream = await downloadContentFromMessage(msg.message.audioMessage, 'audio');
            const buffer = Buffer.concat(await streamToBuffer(stream));
            media = buffer;
            type = 'voice';
            mimetype = msg.message.audioMessage.mimetype;
          } catch {}
        }

        if (content || media) {
          demonDelete.messageCache.set(msg.key.id, {
            content,
            media,
            type,
            mimetype,
            sender: msg.key.participant || msg.key.remoteJid,
            senderFormatted: `@${formatJid(msg.key.participant || msg.key.remoteJid)}`,
            timestamp: Date.now(),
            chatJid: msg.key.remoteJid
          });
        }
      } catch {}
    }
  });

  // 🧼 Handle Message Deletes
  Matrix.ev.on('messages.update', async (updates) => {
    if (!antiDeleteGlobal && !demonDelete.enabled) return;
    if (!updates?.length) return;

    for (const update of updates) {
      try {
        const { key, update: data } = update;
        const isDeleted =
          data?.messageStubType === proto.WebMessageInfo.StubType.REVOKE ||
          data?.status === proto.WebMessageInfo.Status.DELETED;

        if (!isDeleted || key.fromMe || !demonDelete.messageCache.has(key.id)) continue;

        const cached = demonDelete.messageCache.get(key.id);
        demonDelete.messageCache.delete(key.id);

        const chatInfo = await getChatInfo(cached.chatJid);
        const deletedBy = data?.participant
          ? `@${formatJid(data.participant)}`
          : key.participant
          ? `@${formatJid(key.participant)}`
          : 'Unknown Demon';

        const messageType = cached.type ? capitalize(cached.type) : 'Message';

        const baseInfo = `⚔️ *Recovered Deleted ${messageType}*\n\n` +
          `👤 *Sender:* ${cached.senderFormatted}\n` +
          `🗡️ *Deleted By:* ${deletedBy}\n` +
          `🏰 *Location:* ${chatInfo.name}${chatInfo.isGroup ? ' (Group)' : ''}\n` +
          `⏰ *Sent At:* ${demonDelete.formatTime(cached.timestamp)}\n` +
          `🕰️ *Deleted At:* ${demonDelete.formatTime(Date.now())}\n\n` +
          `━━━━━━━━━━━━━━━\nᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴏᴘᴋɪᴅ`;

        if (cached.media) {
          await Matrix.sendMessage(cached.chatJid, {
            [cached.type]: cached.media,
            mimetype: cached.mimetype,
            caption: baseInfo,
            contextInfo: demonContext
          });
        } else if (cached.content) {
          await Matrix.sendMessage(cached.chatJid, {
            text: `${baseInfo}\n\n📜 *Recovered Content:* \n${cached.content}`,
            contextInfo: demonContext
          });
        }
      } catch {}
    }
  });
};

// 🔧 Helpers
const streamToBuffer = async (stream) => {
  const buffers = [];
  for await (const chunk of stream) buffers.push(chunk);
  return buffers;
};

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

export default AntiDelete;
