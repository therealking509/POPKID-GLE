import config from '../../config.cjs';
import { toAudio } from '../../lib/popkid.js'; // Now using lib/popkid.js

const toaudio = async (m, sock) => {
  const prefix = config.PREFIX;
  const body = m.body || '';
  const cmd = body.startsWith(prefix)
    ? body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = body.slice(prefix.length + cmd.length).trim();

  if (cmd === "toaud" || cmd === "toaudio") {
    try {
      const context = m.message?.extendedTextMessage?.contextInfo;
      const qmsg = context?.quotedMessage;

      const mimeType = qmsg?.videoMessage
        ? 'video'
        : qmsg?.audioMessage
        ? 'audio'
        : '';

      if (!qmsg || !/video|audio/.test(mimeType)) {
        return sock.sendMessage(m.chat, {
          text: `🎙️ *Reply to a video or audio message with:* ${prefix + cmd}`,
        }, { quoted: m });
      }

      // 🟢 Prepare download input
      const mediaMessage = {
        key: {
          remoteJid: m.chat,
          id: context.stanzaId,
          fromMe: false,
          participant: context.participant
        },
        message: qmsg
      };

      const media = await sock.downloadMediaMessage(mediaMessage);

      // 🔄 Convert media to MP3 using Popkid lib
      const audio = await toAudio(media, 'mp4');

      // 📤 Send audio file
      await sock.sendMessage(m.chat, {
        audio,
        mimetype: 'audio/mpeg'
      }, { quoted: m });

      // 📢 Styled response
      const caption = `🎧 *AUDIO CONVERTED SUCCESSFULLY*

🎯 Format: Video/Audio → MP3
🚀 Clean and smooth with Popkid GLE
👑 Powered up — just how it should be!

💡 *POPKID GLE BOT*`;

      await sock.sendMessage(m.chat, { text: caption }, { quoted: m });

    } catch (err) {
      console.error(err);
      await sock.sendMessage(m.chat, {
        text: `❌ *Conversion failed.*\nPlease reply to a valid video or audio message.`,
      }, { quoted: m });
    }
  }
};

export default toaudio;
