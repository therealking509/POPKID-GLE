import config from '../../config.cjs';
import fs from 'fs';
import path from 'path';

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

const broadcast = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const msg = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd !== 'broadcast') return;

  if (!m.quoted || m.quoted.message?.documentMessage?.mimetype !== 'text/x-vcard') {
    return sock.sendMessage(m.from, {
      text: `❌ *Please reply to a .vcf contact file*\n\n*Usage:* .broadcast Your message`,
      quoted: m,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363420342566562@newsletter",
        newsletterName: "PᴏᴘᴋɪᴅXᴛᴇᴄʜ",
        serverMessageId: 143,
      }
    });
  }

  if (!msg) {
    return sock.sendMessage(m.from, {
      text: `❌ *Missing message text!*\n\n*Example:* .broadcast Good morning 🌞`,
      quoted: m,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363420342566562@newsletter",
        newsletterName: "PᴏᴘᴋɪᴅXᴛᴇᴄʜ",
        serverMessageId: 143,
      }
    });
  }

  await m.React('📤');

  const media = await sock.downloadMessage(m.quoted.message, 'buffer');
  const vcfText = media.toString();
  const rawNumbers = parseVCFNumbers(vcfText);
  const uniqueNumbers = [...new Set(rawNumbers)];
  const jids = uniqueNumbers.map(num => `${num}@s.whatsapp.net`);

  const validJids = [];
  for (const jid of jids) {
    const res = await sock.onWhatsApp(jid);
    if (res[0]?.exists) validJids.push(jid);
  }

  const sent = [];
  const failed = [];
  const start = new Date().getTime();

  for (const jid of validJids) {
    try {
      await sock.sendMessage(jid, {
        text: `📢 *Broadcast:*\n\n${msg}`,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363420342566562@newsletter",
          newsletterName: "PᴏᴘᴋɪᴅXᴛᴇᴄʜ",
          serverMessageId: 143,
        }
      });
      sent.push(jid);
    } catch {
      failed.push(jid);
    }
  }

  const end = new Date().getTime();
  const duration = ((end - start) / 1000).toFixed(2);

  const resultText = `╭───────◇
│   *📡 VCF Broadcast Summary*
├────────────────────
│ *📁 VCF Entries:* ${uniqueNumbers.length}
│ *✅ Valid on WhatsApp:* ${validJids.length}
│ *📤 Sent Successfully:* ${sent.length}
│ *❌ Failed to Send:* ${failed.length}
│ *⏱️ Duration:* ${duration}s
├────────────────────
│ *📬 Sent To:*
│ ${sent.map(j => '• ' + j.replace(/@.+/, '')).join('\n│ ')}
╰───────◇`;

  await sock.sendMessage(m.from, {
    text: resultText,
    quoted: m,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363420342566562@newsletter",
      newsletterName: "PᴏᴘᴋɪᴅXᴛᴇᴄʜ",
      serverMessageId: 143,
    }
  });
};

export default broadcast;
