import config from '../../config.cjs';

const gcEvent = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === 'welcome') {
    if (!m.isGroup) return m.reply('🚫 *This command only works in group chats!*');

    let menuText;

    if (text === 'on') {
      config.WELCOME = true;
      menuText = `
╭━━━〔  🔔 *WELCOME SYSTEM ENABLED* 🔔 〕━━━╮

✨ *Welcome & Goodbye* system has been  
   successfully *activated* in this group.

👋 Every time a user joins, they'll receive  
   a warm *welcome message*.

📤 When someone leaves, a goodbye note  
   will be shown too.

╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
    } else if (text === 'off') {
      config.WELCOME = false;
      menuText = `
╭━━━〔  🔕 *WELCOME SYSTEM DISABLED* 🔕 〕━━━╮

🚫 The *Welcome & Goodbye* messages  
   have been *deactivated* for this group.

🔇 No notifications will be shown for  
   members joining or leaving.

╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
    } else {
      menuText = `
╭──〔 📘 *WELCOME SYSTEM HELP* 〕──╮

🟢 *Enable*: \`${prefix}welcome on\`  
   ➥ Activates welcome/goodbye messages.

🔴 *Disable*: \`${prefix}welcome off\`  
   ➥ Deactivates welcome/goodbye messages.

📌 *Note:* Only works in group chats.

╰────────────────────────────╯`;
    }

    try {
      // Try to fetch group profile pic, fallback if failed
      let profilePictureUrl;
      try {
        profilePictureUrl = await Matrix.profilePictureUrl(m.chat, 'image');
      } catch {
        profilePictureUrl = 'https://files.catbox.moe/kiy0hl.jpg';
      }

      await Matrix.sendMessage(m.from, {
        image: { url: profilePictureUrl },
        caption: menuText.trim(),
        contextInfo: {
          forwardingScore: 5,
          isForwarded: true,
          externalAdReply: {
            title: "👑 Popkid-Xmd Bot",
            body: "Welcome feature toggled!",
            thumbnailUrl: profilePictureUrl,
            mediaType: 1,
            renderLargerThumbnail: true,
            showAdAttribution: true,
            sourceUrl: "https://github.com/popkid-xmd"
          },
          forwardedNewsletterMessageInfo: {
            newsletterName: "Popkid-Xmd",
            newsletterJid: "120363290715861418@newsletter",
          },
        }
      }, { quoted: m });

    } catch (error) {
      console.error("Error in welcome command:", error);
      await Matrix.sendMessage(m.from, {
        text: '❌ *Something went wrong while processing your request.*',
        contextInfo: {
          forwardingScore: 5,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: "Popkid-Xmd",
            newsletterJid: "120363290715861418@newsletter",
          },
        }
      }, { quoted: m });
    }
  }
};

export default gcEvent;
