import os from 'os';
import { runtime } from '../../lib/functions.js'; // Ensure this exists

const botinfo = async (m, Matrix) => {
  try {
    // Get command
    const prefix = '.';
    const command = m.body.startsWith(prefix)
      ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
      : '';
    if (command !== 'botinfo') return;

    // ===== Manual Static Values =====
    const botName = 'Popkid-Xmd';
    const version = '3.0';
    const creator = '254712345678'; // Owner number (no +)

    // ===== Dynamic Values =====
    const uptime = runtime(); // Should return "HH:MM:SS"
    const chats = Matrix.chats || {};
    const totalChats = Object.keys(chats).length;
    const hostname = os.hostname();
    const platform = os.platform();

    // Use these if available, else fallback
    const mode = global.config?.MODE?.toUpperCase?.() || 'PUBLIC';
    const alwaysOnline = global.config?.ALWAYS_ONLINE ? '🟢 ENABLED' : '🔴 DISABLED';

    // ===== Stylish Forwarded Output =====
    await Matrix.sendMessage(m.from, {
      text: 
`🤖 *Bot Information*

📌 Name: *${botName}*
👑 Creator: wa.me/${creator}
⚙️ Version: *v${version}*

🔰 Mode: *${mode}*
♻️ Always Online: ${alwaysOnline}
⏱️ Uptime: *${uptime}*
💬 Total Chats: *${totalChats}*

🧠 Platform: ${platform}
💻 Hostname: ${hostname}`,
      contextInfo: {
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363290715861418@newsletter",
          newsletterName: "Popkid-Xmd"
        }
      }
    });

  } catch (e) {
    console.error('❌ botinfo error:', e);
    await m.reply('⚠️ Error fetching bot info. Please try again.');
  }
};

export default botinfo;
