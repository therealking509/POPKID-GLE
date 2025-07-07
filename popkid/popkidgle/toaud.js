// audio

import config from '../../config.cjs';
import { toAudio } from '../../lib/popkid.js';

const toaudio = async (m, sock) => {
  try {
    const prefix = config.PREFIX || '.';
    const command = m.body?.slice(prefix.length).split(' ')[0].toLowerCase();

    if (command !== 'toaud' && command !== 'toaudio') return;

    const quoted = m.quoted || m.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quoted) {
      return sock.sendMessage(m.chat, {
        text: `🎙️ *Reply to a video or audio with:* ${prefix + command}`,
      }, { quoted: m });
    }

    const mime = quoted.videoMessage
      ? 'video'
      : quoted.audioMessage
      ? 'audio'
      : '';

    if (!/video|audio/.test(mime)) {
      return sock.sendMessage(m.chat, {
        text: `🎙️ *Only reply to a video or audio message!*`,
      }, { quoted: m });
    }

    // 🟢 Download media
    const media = await sock.downloadMediaMessage(
      m.quoted ? m.quoted : {
        key: {
          remoteJid: m.chat,
          id: m.message?.extendedTextMessage?.contextInfo?.stanzaId,
          fromMe: false,
          participant: m.message?.extendedTextMessage?.contextInfo?.participant
        },
        message: quoted
      }
    );

    // 🔁 Convert to audio
    const audio = await toAudio(media, 'mp4');

    // 🎧 Send audio
    await sock.sendMessage(m.chat, {
      audio: audio,
      mimetype: 'audio/mpeg',
    }, { quoted: m });

    // 💬 Styled confirmation
    await sock.sendMessage(m.chat, {
      text: `🎧 *AUDIO CONVERTED SUCCESSFULLY*\n\n🎯 Format: Video/Audio → MP3\n🚀 Popkid Smooth Output\n👑 Powered by POPKID GLE BOT`,
    }, { quoted: m });

  } catch (err) {
    console.error('[TOAUDIO ERROR]', err);
    await sock.sendMessage(m.chat, {
      text: `❌ *Conversion failed.*\nMake sure to reply to a proper video/audio message.`,
    }, { quoted: m });
  }
};

export default toaudio;
