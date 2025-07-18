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

const broadcast = async (m, sock) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix)
      ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
      : '';
    const msg = m.body.slice(prefix.length + cmd.length).trim();

    if (cmd !== 'broadcast') return;

    if (!m.quoted || m.quoted.message?.documentMessage?.mimetype !== 'text/x-vcard') {
      return sock.sendMessage(m.from, {
        text: `❌ *Please reply to a .vcf contact file*\n\n*Usage:* .broadcast Hello message`,
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
        text: `❌ *Please provide a message to broadcast!*\n\n*Example:* .broadcast Good morning 🌞`,
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
      try {
        const res = await sock.onWhatsApp(jid);
        if (res[0]?.exists) validJids.push(jid);
      } catch (err) {
        console.error(`Failed WhatsApp check for ${jid}:`, err);
      }
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
      } catch (err) {
        console.error(`❌ Failed to send to ${jid}:`, err);
        failed.push(jid);
      }
    }

    const end = new Date().getTime();
    const duration = ((end - start) / 1000).toFixed(2);

    const text = `╭───『 *📡 Broadcast Summary* 』───╮
│
│ *📁 Total in VCF:* ${uniqueNumbers.length}
│ *✅ WhatsApp Users:* ${validJids.length}
│ *📤 Sent:* ${sent.length}
│ *❌ Failed:* ${failed.length}
│ *⏱️ Duration:* ${duration}s
│
│ *📬 Sent to:*
│ ${sent.map(j => '• ' + j.replace(/@.+/, '')).join('\n│ ') || 'None'}
╰──────────────────────────────╯`;

    await sock.sendMessage(m.from, {
      text,
      quoted: m,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363420342566562@newsletter",
        newsletterName: "PᴏᴘᴋɪᴅXᴛᴇᴄʜ",
        serverMessageId: 143,
      }
    });
  } catch (err) {
    console.error("Broadcast command failed:", err);
    await sock.sendMessage(m.from, {
      text: `❌ *An error occurred during broadcast.*\n\nMake sure you replied to a proper *.vcf* file and try again.`,
      quoted: m,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363420342566562@newsletter",
        newsletterName: "PᴏᴘᴋɪᴅXᴛᴇᴄʜ",
        serverMessageId: 143,
      }
    });
  }
};

export default broadcast;
