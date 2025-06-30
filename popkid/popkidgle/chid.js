import config from '../../config.cjs';

const chid = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd !== 'chid') return;

  if (!text || !text.includes('whatsapp.com/channel/')) {
    return await sock.sendMessage(m.from, {
      text: `❌ *Invalid channel link!*\n\nUse the format:\n${prefix}chid https://whatsapp.com/channel/xxxxxxxxxxxxxxxxxxxxxx`
    }, { quoted: m });
  }

  try {
    const match = text.match(/channel\/([a-zA-Z0-9]+)/);
    const channelId = match ? match[1] : null;

    if (!channelId) {
      return await sock.sendMessage(m.from, {
        text: `⚠️ *Unable to extract Channel ID.*\nDouble-check the link format.`
      }, { quoted: m });
    }

    const newsletterJid = `${channelId}@newsletter`;

    const styledText = `┏━━━━━━━━━━━━━━━━━━━┓
┃   📡 *Newsletter JID Created!*   ┃
┗━━━━━━━━━━━━━━━━━━━┛
🧬 *Channel Link:*
${text}

🆔 *JID:* 
\`\`\`${newsletterJid}\`\`\`

✅ *You can now use this JID to forward newsletter-style messages!*
────────────────────`;

    await sock.sendMessage(m.from, {
      text: styledText,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: "Popkid GLE AutoJID",
          newsletterJid
        },
        externalAdReply: {
          title: "GLE Channel ID Builder",
          body: "Turn WhatsApp Channel Links into JIDs 🧠",
          thumbnailUrl: "https://files.catbox.moe/77zp7c.png",
          sourceUrl: "https://github.com/devpopkid",
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: true
        }
      }
    }, { quoted: m });

  } catch (err) {
    await sock.sendMessage(m.from, {
      text: `❌ *Something went wrong while creating the JID.*\n_Reason:_ ${err.message || 'Unknown error'}`
    }, { quoted: m });
  }
};

export default chid;
