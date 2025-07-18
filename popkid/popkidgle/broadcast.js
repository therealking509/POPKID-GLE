import fs from 'fs';
import path from 'path';
import config from '../../config.cjs';

const parseVCFNumbers = (vcfText) => {
  const regex = /TEL[^:]*:(\+?\d+)/g;
  const numbers = [];
  let match;
  while ((match = regex.exec(vcfText)) !== null) {
    const num = match[1].replace(/\D/g, '');
    if (num.length >= 9) numbers.push(num);
  }
  return numbers;
};

const broadcast = async (m, sock, { args }) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const message = m.body.slice(prefix.length + cmd.length).trim();

  if (!m.quoted || m.quoted.message?.documentMessage?.mimetype !== 'text/x-vcard') {
    return sock.sendMessage(m.from, {
      text: `❌ *Please reply to a .vcf contact file*\n\n_Usage: .broadcast Hello fam!_`,
      quoted: m,
    });
  }

  if (!message) {
    return sock.sendMessage(m.from, {
      text: `❌ *Missing message text.*\n\n_Usage: .broadcast Hello guys_`,
      quoted: m,
    });
  }

  await m.React('📤');

  const media = await sock.downloadMessage(m.quoted.message, 'buffer');
  const vcfText = media.toString();
  const rawNumbers = parseVCFNumbers(vcfText);
  const uniqueNumbers = [...new Set(rawNumbers)];
  const jids = uniqueNumbers.map(num => `${num}@s.whatsapp.net`);

  const validJids = [];
  const invalidJids = [];

  for (const jid of jids) {
    try {
      const res = await sock.onWhatsApp(jid);
      if (res && res[0]?.exists) validJids.push(jid);
      else invalidJids.push(jid);
    } catch {
      invalidJids.push(jid);
    }
  }

  const recipients = [];
  const failed = [];
  const start = new Date().getTime();

  for (const jid of validJids) {
    try {
      await sock.sendMessage(jid, { text: `📢 *Broadcast:*\n\n${message}` });
      recipients.push(jid);
    } catch (e) {
      failed.push(jid);
    }
  }

  const end = new Date().getTime();
  const duration = ((end - start) / 1000).toFixed(1);

  const summary = `\`\`\`📡 VCF Broadcast Summary\`\`\`\n\n` +
                  `*📁 VCF Contacts:* ${uniqueNumbers.length}\n` +
                  `*✅ WhatsApp Numbers:* ${validJids.length}\n` +
                  `*📤 Successfully Sent:* ${recipients.length}\n` +
                  `*❌ Failed:* ${failed.length}\n` +
                  `*⏱️ Duration:* ${duration} sec\n\n` +
                  `📬 *Sent To:*\n${recipients.map(jid => `• ${jid.replace(/@.+/, '')}`).join('\n')}`;

  // Send summary styled
  await sock.sendMessage(m.from, {
    text: summary,
    quoted: m,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363420342566562@newsletter",
      newsletterName: "PᴏᴘᴋɪᴅXᴛᴇᴄʜ",
      serverMessageId: 143,
    },
  });

  // Save failed to CSV if any
  if (failed.length > 0) {
    const csv = failed.join('\n');
    const filePath = path.join('/mnt/data', 'broadcast_failed.csv');
    fs.writeFileSync(filePath, csv);

    await sock.sendMessage(m.from, {
      document: { url: filePath },
      mimetype: 'text/csv',
      fileName: 'broadcast_failed.csv',
      caption: '📄 *Failed to Deliver List*',
      quoted: m,
    });
  }
};

export default {
  pattern: "broadcast",
  alias: ["vcfbroadcast", "vcfbc"],
  desc: "Reply to a VCF file and send broadcast to its contacts.",
  category: "owner",
  filename: __filename,
  use: "<message> (reply to .vcf)",
  react: "📤",
  onlyOwner: true,
  run: broadcast,
};
