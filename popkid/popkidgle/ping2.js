import config from "../../config.cjs";

const ping = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(" ")[0].toLowerCase() : "";

  if (cmd === "ping2") {
    const start = new Date().getTime();
    await m.React("⏳");
    const end = new Date().getTime();
    const speed = (end - start).toFixed(2);

    const responseText = `*🏓 Pɪɴɢ Sᴘᴇᴇᴅ:* *${speed} ms*`;

    const newsletterInfo = {
      newsletterJid: "120363420342566562@newsletter",
      newsletterName: "ᴘᴏᴘᴋɪᴅ xᴍᴅ",
      serverMessageId: -1
    };

    const adReply = {
      title: "ᴘᴏᴘᴋɪᴅ xᴍᴅ ʙᴏᴛ",
      body: "⚡ Sᴇʀᴠᴇʀ ʟᴀᴛᴇɴᴄʏ ᴛᴇsᴛ",
      thumbnailUrl: "https://files.catbox.moe/kiy0hl.jpg",
      sourceUrl: "https://whatsapp.com/channel/0029VbB6d0KKAwEdvcgqrH26",
      mediaType: 1,
      renderLargerThumbnail: false
    };

    const contextInfo = {
      isForwarded: true,
      forwardedNewsletterMessageInfo: newsletterInfo,
      forwardingScore: 999,
      externalAdReply: adReply
    };

    await m.React("✅");

    await sock.sendMessage(m.from, {
      text: responseText,
      contextInfo
    }, { quoted: m });
  }
};

export default ping;
