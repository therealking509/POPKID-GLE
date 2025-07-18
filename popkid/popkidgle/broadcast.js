import fs from "fs";
import path from "path";
import { parse } from "vcf";
import { downloadMediaMessage } from "@whiskeysockets/baileys";
import config from "../../config.cjs";

const newsletterInfo = {
  newsletterJid: "120363420342566562@newsletter",
  newsletterName: "PᴏᴘᴋɪᴅXᴛᴇᴄʜ",
  serverMessageId: 143,
};

const broadcast = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";
  const message = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd !== "broadcast") return;
  if (!m.quoted || m.quoted.message?.contactMessage === undefined && m.quoted.message?.documentMessage?.fileName?.endsWith(".vcf") !== true)
    return sock.sendMessage(m.from, {
      text: "*❌ Reply to a `.vcf` file with the message to broadcast.*",
      quoted: m,
      ...newsletterInfo,
    });

  await m.React("📤");

  const mediaPath = path.join("/tmp", `${Date.now()}.vcf`);
  const stream = await downloadMediaMessage(m.quoted, "buffer", {}, { sock });
  fs.writeFileSync(mediaPath, stream);

  const contactsRaw = fs.readFileSync(mediaPath, "utf8");
  const parsed = parse(contactsRaw);
  const numbers = parsed
    .map((c) => c.data.tel && c.data.tel.value)
    .filter((n) => n)
    .map((n) => n.replace(/\D/g, ""))
    .filter((n) => n.length >= 8)
    .map((n) => (n.endsWith("@s.whatsapp.net") ? n : `${n}@s.whatsapp.net`));

  let sent = 0;
  const failed = [];

  for (const num of numbers) {
    try {
      await sock.sendMessage(num, {
        text: message,
        ...newsletterInfo,
      });
      sent++;
    } catch (e) {
      failed.push(num.replace("@s.whatsapp.net", ""));
    }
    await new Promise((r) => setTimeout(r, 200)); // Slow down to avoid rate limits
  }

  const summary = `
📢 *VCF Broadcast Complete*
────────────────────
👥 *Total Contacts:* ${numbers.length}
✅ *Successfully Sent:* ${sent}
❌ *Failed:* ${failed.length}

${
  failed.length > 0
    ? `📛 *Failed Numbers:*\n${failed.map((n) => "• " + n).join("\n")}`
    : ""
}

🔁 *Your Message:*
${message}
────────────────────
🛰 *Bot:* PᴏᴘᴋɪᴅXᴛᴇᴄʜ
`;

  await sock.sendMessage(
    m.from,
    { text: summary.trim(), quoted: m, ...newsletterInfo },
    { quoted: m }
  );

  fs.unlinkSync(mediaPath);
};

export default broadcast;
