import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import config from '../../config.cjs';
import path from 'path';

// Setup module resolution
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const reminiPath = path.resolve(__dirname, '../remini.cjs');
const { remini } = require(reminiPath);

// Enhance command handler
const tohd = async (m, gss) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  const validCommands = ['hdr', 'hd', 'remini', 'enhance', 'upscale'];

  if (!validCommands.includes(cmd)) return;

  if (!m.quoted || m.quoted.mtype !== 'imageMessage') {
    return m.reply(
      `*📸 Send or reply to an image to enhance its quality using* _${prefix + cmd}_`
    );
  }

  const media = await m.quoted.download();
  if (!media) {
    return m.reply('⚠️ Failed to download the image. Please try again.');
  }

  try {
    const enhancedImage = await remini(media, 'enhance');

    await gss.sendMessage(
      m.from,
      {
        image: enhancedImage,
        caption: `> ✨ *Hey ${m.pushName}, here’s your enhanced image — powered by POPKID-MD!*`,
      },
      { quoted: m }
    );
  } catch (error) {
    console.error('🚫 Error processing image:', error);
    m.reply('❌ Error processing media. Please try again later.');
  }
};

export default tohd;
