import config from '../../config.cjs';

const checkChannel = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "cekidch" || cmd === "idch") {
    if (!text)
      return sock.sendMessage(m.from, { text: "❌ *Please provide a WhatsApp channel link!*" }, { quoted: m });

    if (!text.includes("https://whatsapp.com/channel/"))
      return sock.sendMessage(m.from, { text: "❌ *Invalid link!* Must be a WhatsApp channel link." }, { quoted: m });

    try {
      const channelCode = text.split("https://whatsapp.com/channel/")[1];
      const res = await sock.newsletterMetadata("invite", channelCode);

      const teks = `🎯 *Channel Info*
━━━━━━━━━━━━━━
🆔 *ID:* ${res.id}
📛 *Name:* ${res.name}
👥 *Followers:* ${res.subscribers}
📶 *Status:* ${res.state}
✅ *Verified:* ${res.verification === "VERIFIED" ? "Yes 🔵" : "No ❌"}`;

      sock.sendMessage(m.from, { text: teks }, { quoted: m });
    } catch (err) {
      console.error("Channel check error:", err);
      sock.sendMessage(m.from, { text: "⚠️ *Failed to fetch channel info. Please check the link or try again.*" }, { quoted: m });
    }
  }
};

export default checkChannel;
