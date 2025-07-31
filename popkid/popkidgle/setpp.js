const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function setProfilePicture(sock, m) {
  const chatId = m.from;
  const isOwner = m.key.fromMe;

  try {
    await m.React('⏳');

    // Owner Check
    if (!isOwner) {
      const errorText = `*SetPP▰▰▰▱▱ 403 - Unauthorized*\n\n🚫 *Only the bot owner can use this command.*`;
      await sock.sendMessage(chatId, {
        text: errorText,
        contextInfo: {
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363420342566562@newsletter",
            newsletterName: "Popkid-Xmd",
            serverMessageId: m.key.id
          }
        }
      }, { quoted: m });
      return;
    }

    // Image Validation
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const image = quoted?.imageMessage || quoted?.stickerMessage;

    if (!image) {
      const errorText = `*SetPP▰▰▱▱▱ 400 - Bad Request*\n\n⚠️ *Reply to an image or sticker* to set as bot's profile picture.`;
      await sock.sendMessage(chatId, {
        text: errorText,
        contextInfo: {
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363420342566562@newsletter",
            newsletterName: "Popkid-Xmd",
            serverMessageId: m.key.id
          }
        }
      }, { quoted: m });
      return;
    }

    // Download Image
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const stream = await downloadContentFromMessage(image, 'image');
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    const filePath = path.join(tmpDir, `pp_${Date.now()}.jpg`);
    fs.writeFileSync(filePath, buffer);

    // Set Profile Picture
    await sock.updateProfilePicture(sock.user.id, { url: filePath });
    fs.unlinkSync(filePath);
    await m.React('✅');

    const successText = `*SetPP▰▰▰▰▰ 200 - Success*\n\n🖼️ *Bot profile picture updated successfully!*`;
    await sock.sendMessage(chatId, {
      text: successText,
      contextInfo: {
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363420342566562@newsletter",
          newsletterName: "Popkid-Xmd",
          serverMessageId: m.key.id
        }
      }
    }, { quoted: m });

  } catch (err) {
    console.error("SetPP Error:", err);
    await m.React('❌');

    const failText = `*SetPP▰▰▰▱▱ 500 - Internal Error*\n\n❌ *Something went wrong while setting profile picture.*`;
    await sock.sendMessage(chatId, {
      text: failText,
      contextInfo: {
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363420342566562@newsletter",
          newsletterName: "Popkid-Xmd",
          serverMessageId: m.key.id
        }
      }
    }, { quoted: m });
  }
}

module.exports = setProfilePicture;
