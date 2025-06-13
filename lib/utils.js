import { showPresence } from '../../lib/utils.js'; // adjust path if needed

const sayCommand = async (m, Matrix) => {
  const text = m.body.slice(config.PREFIX.length + 3).trim();
  if (!text) return m.reply('❌ *Please provide text to speak!*');

  if (config.AUTO_TYPING) {
    await showPresence(Matrix, m.chat, 'recording');
  }

  // then fetch or generate the voice note (example)
  const audioBuffer = await generateVoice(text); // your TTS function

  await Matrix.sendMessage(m.chat, {
    audio: audioBuffer,
    mimetype: 'audio/mp4',
    ptt: true
  }, { quoted: m });
};
