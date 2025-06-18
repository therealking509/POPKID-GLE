import os from 'os';
import config from '../../config.cjs';
import { runtime } from '../../lib/functions.js';

const statusCommand = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.slice(prefix.length).split(' ')[0].toLowerCase();

  if (cmd !== 'status') return;

  const sendStyled = (txt) => Matrix.sendMessage(m.from, {
    text: txt,
    contextInfo: {
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363290715861418@newsletter",
        newsletterName: "Popkid-Xmd"
      }
    }
  });

  const uptime = runtime(); // HH:MM:SS
  const totalChats = Object.keys(Matrix.chats || {}).length;
  const mode = config.MODE?.toUpperCase() || 'UNKNOWN';
  const alwaysOnline = config.ALWAYS_ONLINE ? '🟢 ENABLED' : '🔴 DISABLED';
  const version = config.VERSION || '1.0.0'; // Add this in your config
  const owner = config.OWNER_NUMBER || 'Not Set';
  const platform = os.platform();
  const hostname = os.hostname();

  return sendStyled(
`📟 *Popkid-Xmd Status*

🔰 Mode: *${mode}*
♻️ Always Online: ${alwaysOnline}
⏱️ Uptime: ${uptime}
💬 Active Chats: ${totalChats}

📌 Version: v${version}
👑 Owner: wa.me/${owner}

🧠 Platform: ${platform}
💻 Hostname: ${hostname}`
  );
};

export default statusCommand;
