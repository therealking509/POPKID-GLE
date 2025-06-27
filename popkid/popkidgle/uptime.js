import moment from "moment-timezone";
import { generateWAMessageFromContent, proto } from "@whiskeysockets/baileys";
import config from "../../config.cjs";

const joel = async (m, sock) => {
  const prefix = config.PREFIX;
  const command = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (["uptime", "alive", "runtime"].includes(command)) {
    await m.React("⏳");

    const uptimeSeconds = process.uptime();
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    const now = moment().tz("Africa/Nairobi").format("HH:mm:ss");
    let greeting = "Good Night 🌌";
    if (now < "05:00:00") greeting = "Good Morning 🌄";
    else if (now < "11:00:00") greeting = "Good Morning 🌄";
    else if (now < "15:00:00") greeting = "Good Afternoon 🌅";
    else if (now < "19:00:00") greeting = "Good Evening 🌃";

    await m.React("☄️");

    await sock.sendMessage(m.from, {
      audio: { url: "https://files.catbox.moe/g097op.mp3" },
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
          body: `UPTIME ${days}D ${hours}H ${minutes}M ${seconds}S`,
          thumbnailUrl: "https://files.catbox.moe/u46hbi.jpg",
          sourceUrl: "https://whatsapp.com/channel/0029VbB6d0KKAwEdvcgqrH26",
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m });
  }
};

export default joel;
