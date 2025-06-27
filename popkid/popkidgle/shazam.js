import fetch from 'node-fetch';
import FormData from 'form-data';
import config from '../../config.cjs';

const auddKey = '4efe0d3fd968a2b253b52f91a8e01e84';

const toBuffer = async (input) => {
  if (Buffer.isBuffer(input)) return input;
  return new Promise((resolve, reject) => {
    const chunks = [];
    input.on('data', chunk => chunks.push(chunk));
    input.on('end', () => resolve(Buffer.concat(chunks)));
    input.on('error', reject);
  });
};

export default {
  name: 'shazam',
  alias: ['whatmusic', 'songid'],
  category: 'fun',
  desc: 'Identify music using AudD API',

  async exec(m, sock) {
    if (!m.quoted) {
      return m.reply(`🎧 *Music ID Request*\n\nPlease reply to a music audio or voice note to identify it.\n_Example:_ *.shazam*`, {
        contextInfo: {
          forwardingScore: 5,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: "Popkid-Xmd",
            newsletterJid: "120363420342566562@newsletter",
          },
        }
      });
    }

    const mime = m.quoted?.mimetype || '';
    const allowed = ['audio', 'video', 'application/octet-stream'];
    if (!allowed.some(t => mime.startsWith(t))) {
      return m.reply(`❌ *Unsupported File*\nPlease reply to an *audio*, *voice note*, or *video clip*.`, {
        contextInfo: {
          forwardingScore: 5,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: "Popkid-Xmd",
            newsletterJid: "120363420342566562@newsletter",
          },
        }
      });
    }

    const media = await m.quoted.download();
    if (!media) return m.reply('❌ Failed to download the media.');

    const buffer = await toBuffer(media);
    if (buffer.length < 100000) {
      return m.reply(`⚠️ *Audio Too Short*\nPlease use a longer or clearer clip.`, {
        contextInfo: {
          forwardingScore: 5,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: "Popkid-Xmd",
            newsletterJid: "120363420342566562@newsletter",
          },
        }
      });
    }

    await m.reply(`🔍 *Analyzing the song... Please wait...*`, {
      contextInfo: {
        forwardingScore: 5,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: "Popkid-Xmd",
          newsletterJid: "120363420342566562@newsletter",
        },
      }
    });

    try {
      const form = new FormData();
      form.append('file', buffer, { filename: 'audio.mp3' });
      form.append('api_token', auddKey);
      form.append('return', 'apple_music,spotify,lyrics');

      const res = await fetch('https://api.audd.io/', {
        method: 'POST',
        body: form,
      });

      const json = await res.json();
      if (!json.result) throw new Error('No match found');

      const song = json.result;
      const resultText = `
🎶 *Track Identified!*

• 🎵 *Title:* ${song.title || 'Unknown'}
• 👤 *Artist:* ${song.artist || 'Unknown'}
• 💿 *Album:* ${song.album || 'Unknown'}
• 📅 *Release:* ${song.release_date || 'N/A'}
${song.spotify?.external_urls?.spotify ? `• 🎧 *Spotify:* ${song.spotify.external_urls.spotify}` : ''}
${song.apple_music?.url ? `• 🍎 *Apple Music:* ${song.apple_music.url}` : ''}
${song.lyrics ? `\n📝 *Lyrics Preview:*\n${song.lyrics.slice(0, 300)}...` : ''}

✅ _Powered by AudD.io_
      `.trim();

      return m.reply(resultText, {
        contextInfo: {
          forwardingScore: 5,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: "Popkid-Xmd",
            newsletterJid: "120363420342566562@newsletter",
          },
        }
      });

    } catch (err) {
      console.error('AudD Error:', err);
      return m.reply(`❌ *Failed to identify the track.*\n_Reason:_ ${err.message || 'Unknown error'}`, {
        contextInfo: {
          forwardingScore: 5,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: "Popkid-Xmd",
            newsletterJid: "120363420342566562@newsletter",
          },
        }
      });
    }
  }
};
