import moment from "moment-timezone";
import { generateWAMessageFromContent, proto } from "@whiskeysockets/baileys";
import config from "../../config.cjs";

const popkid = async (m, sock) => {
  const prefix = config.PREFIX;
  const body = m.body || '';
  const command = body.startsWith(prefix) ? body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (!["uptime", "alive", "runtime"].includes(command)) return;

  await m.React("⏳");

  const uptime = process.uptime();
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  const now = moment().tz("Africa/Nairobi").format("HH:mm:ss");
  let greeting = "Hello 👋";
  if (now < "05:00:00") greeting = "Good Night 🌌";
  else if (now < "11:00:00") greeting = "Good Morning 🌄";
  else if (now < "15:00:00") greeting = "Good Afternoon 🌞";
  else greeting = "Good Evening 🌃";

  await m.React("⚡");

  const audioUrl = "https://files.catbox.moe/g097op.mp3";
  const thumbUrl = "https://files.catbox.moe/u46hbi.jpg";

  await sock.sendMessage(m.from, {
    audio: { url: audioUrl },
    mimetype: "audio/mp4",
    ptt: true,
    contextInfo: {
      mentionedJid: [m.sender],
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363420342566562@newsletter",
        newsletterName: "popkid xmd",
        serverMessageId: 143
      },
      externalAdReply: {
        title: "ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴏᴘᴋɪᴅ",
        body: `UPTIME: ${days}D ${hours}H ${minutes}M ${seconds}S`,
        thumbnailUrl: thumbUrl,
        sourceUrl: "https://whatsapp.com/channel/0029VbB6d0KKAwEdvcgqrH26",
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m });
};

export default popkid;
