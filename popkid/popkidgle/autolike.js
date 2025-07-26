import config from '../../config.cjs'; // Your config file
import fs from 'fs';

// Emoji pool for random reactions
const emojiList = ['❤️', '💸', '😇', '🍂', '💥', '💯', '🔥', '💫', '💎', '💗'];

// Temporary runtime flag (will override config.AUTO_STATUS_REACT)
let autoLikeEnabled = config.AUTO_STATUS_REACT === 'true';

// Handle the `.autolike on/off` command
const handleAutoLikeCommand = async (m, Matrix) => {
  const body = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
  const command = body.trim().toLowerCase();

  if (command.startsWith('.autolike')) {
    const arg = command.split(' ')[1];

    if (arg === 'on') {
      autoLikeEnabled = true;
      await Matrix.sendMessage(m.key.remoteJid, {
        text: '✅ *Auto status reactions enabled!*'
      });
    } else if (arg === 'off') {
      autoLikeEnabled = false;
      await Matrix.sendMessage(m.key.remoteJid, {
        text: '❌ *Auto status reactions disabled.*'
      });
    } else {
      await Matrix.sendMessage(m.key.remoteJid, {
        text: 'ℹ️ *Usage:* `.autolike on` or `.autolike off`'
      });
    }
  }
};

// Auto-react to statuses if enabled
const autoStatusReact = async (mek, Matrix) => {
  try {
    if (
      mek &&
      mek.key?.remoteJid === 'status@broadcast' &&
      autoLikeEnabled
    ) {
      const randomEmoji = emojiList[Math.floor(Math.random() * emojiList.length)];

      await Matrix.sendMessage(mek.key.remoteJid, {
        react: {
          text: randomEmoji,
          key: mek.key
        }
      });

      console.log(`✅ Reacted to status with ${randomEmoji}`);
    }
  } catch (error) {
    console.error('❌ Error in autoStatusReact:', error);
  }
};

// Export both
export default {
  handleAutoLikeCommand,
  autoStatusReact
};
