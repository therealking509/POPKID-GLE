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
      text: `❌ Please reply to a *.vcf* contact file.\n\n*Usage:* .broadcast Hello!`,
      quoted: m,
    });
  }

  if (!msg) {
    return sock.sendMessage(m.from, {
      text: `❌ Please provide a message to broadcast.\n\n*Example:* .broadcast Good morning ☀️`,
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
  for (const jid of jids) {
    const res = await sock.onWhatsApp(jid);
    if (res[0]?.exists) validJids.push(jid);
  }

  const sent = [];
  const failed = [];
  const start = new Date().getTime();

  for (const jid of validJids) {
    try {
      await sock.sendMessage(jid, { text: `📢 *Broadcast:*\n\n${msg}` });
      sent.push(jid);
    } catch {
      failed.push(jid);
    }
  }

  const end = new Date().getTime();
  const duration = ((end - start) / 1000).toFixed(2);

  const text = `\`\`\`📡 Broadcast Report\`\`\`\n` +
               `*📁 VCF Contacts:* ${uniqueNumbers.length}\n` +
               `*✅ WhatsApp Valid:* ${validJids.length}\n` +
               `*📤 Sent:* ${sent.length}\n` +
               `*❌ Failed:* ${failed.length}\n` +
               `*⏱️ Time:* ${duration}s\n\n` +
               `📬 *Sent To:*\n${sent.map(j => '• ' + j.replace(/@.+/, '')).join('\n')}`;

  sock.sendMessage(m.from, {
    text,
    quoted: m,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363420342566562@newsletter",
      newsletterName: "PᴏᴘᴋɪᴅXᴛᴇᴄʜ",
      serverMessageId: 143,
    }
  });
};

export default broadcast;
