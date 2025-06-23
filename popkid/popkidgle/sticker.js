import { writeFileSync, unlinkSync, existsSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { downloadMediaMessage } from '@whiskeysockets/baileys';
import config from '../../config.cjs';

const tmp = tmpdir();

const sticker = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  if (cmd !== 'sticker') return;

  const qmsg = m.quoted || m;
  const mime = qmsg?.mimetype || '';

  if (!/image|video/.test(mime)) {
    return await Matrix.sendMessage(m.from, {
      text: `📸 Send or reply to an *image or short video* with:\n*${prefix}sticker*`,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363290715861418@newsletter',
          newsletterName: 'Popkid-Xmd',
          serverMessageId: 99
        }
      }
    }, { quoted: m });
  }

  try {
    const mediaBuffer = await downloadMediaMessage(qmsg, 'buffer', {}, {});
    const inputExt = mime.includes('video') ? 'mp4' : 'jpg';
    const inputPath = path.join(tmp, `input_${Date.now()}.${inputExt}`);
    const outputPath = path.join(tmp, `output_${Date.now()}.webp`);

    writeFileSync(inputPath, mediaBuffer);

    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .inputOptions(['-y'])
        .outputOptions([
          '-vcodec', 'libwebp',
          '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:-1:-1:color=0x00000000',
          '-loop', '0',
          '-ss', '0',
          '-t', '10',
          '-preset', 'default',
          '-an',
          '-vsync', '0'
        ])
        .toFormat('webp')
        .save(outputPath)
        .on('end', resolve)
        .on('error', reject);
    });

    if (!existsSync(outputPath)) throw new Error('WebP output not found.');

    const stickerBuffer = readFileSync(outputPath);
    await Matrix.sendMessage(m.from, {
      sticker: stickerBuffer,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363290715861418@newsletter',
          newsletterName: 'Popkid-Xmd',
          serverMessageId: 99
        }
      }
    }, { quoted: m });

    // Clean up temp files
    unlinkSync(inputPath);
    unlinkSync(outputPath);
  } catch (err) {
    console.error('❌ Sticker creation failed:', err);
    await Matrix.sendMessage(m.from, {
      text: `❌ *Sticker Failed:* Unable to convert media.\n_Try again with a valid image or short video under 10s._`,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363290715861418@newsletter',
          newsletterName: 'Popkid-Xmd',
          serverMessageId: 99
        }
      }
    }, { quoted: m });
  }
};

export default sticker;
