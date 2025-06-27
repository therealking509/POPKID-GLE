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
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix)
      ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
      : '';
    const valid = ['shazam', 'whatmusic', 'songid'];
    if (!valid.includes(cmd)) return;

    if (!m.quoted) {
      return sock.sendMessage(m.from, {
        text: `🎵 *Music ID Request*\n\nReply to a voice note or song to identify it.\n\n_Example:_ *.shazam*`,
        contextInfo: {
          forwardingScore: 2,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: 'Popkid-Xmd',
            newsletterJid: '120363420342566562@newsletter',
          },
        },
      }, { quoted: m });
    }

    const mime = m.quoted?.mimetype || '';
    const types = ['audio', 'video', 'application/octet-stream'];
    if (!types.some(t => mime.startsWith(t))) {
      return sock.sendMessage(m.from, {
        text: `❌ *Unsupported File*\nPlease reply to an audio, video, or music file.`,
        contextInfo: {
          forwardingScore: 2,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: 'Popkid-Xmd',
            newsletterJid: '120363420342566562@newsletter',
          },
        },
      }, { quoted: m });
    }

    const media = await m.quoted.download();
    if (!media) return m.reply('❌ Failed to download media.');

    const buffer = await toBuffer(media);
    if (buffer.length < 100000) {
      return sock.sendMessage(m.from, {
        text: `⚠️ *Audio Too Short*\nTry again with a longer or clearer clip.`,
        contextInfo: {
          forwardingScore: 2,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: 'Popkid-Xmd',
            newsletterJid: '120363420342566562@newsletter',
          },
        },
      }, { quoted: m });
    }

    await sock.sendMessage(m.from, {
      text: `🔍 *Analyzing the song...*`,
      contextInfo: {
        forwardingScore: 2,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: 'Popkid-Xmd',
          newsletterJid: '120363420342566562@newsletter',
        },
      },
    }, { quoted: m });

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
      if (!json.result) throw new Error('No song identified.');

      const song = json.result;
      const text = `
🎶 *Track Identified!*

• 🎵 *Title:* ${song.title || 'Unknown'}
• 👤 *Artist:* ${song.artist || 'Unknown'}
• 💿 *Album:* ${song.album || 'Unknown'}
• 📅 *Release:* ${song.release_date || 'N/A'}
${song.spotify?.external_urls?.spotify ? `• 🎧 *Spotify:* ${song.spotify.external_urls.spotify}` : ''}
${song.apple_music?.url ? `• 🍎 *Apple Music:* ${song.apple_music.url}` : ''}
${song.lyrics ? `\n📝 *Lyrics Preview:*\n${song.lyrics.slice(0, 200)}...` : ''}

✅ _Powered by AudD.io_
      `.trim();

      await sock.sendMessage(m.from, {
        text,
        contextInfo: {
          forwardingScore: 2,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: 'Popkid-Xmd',
            newsletterJid: '120363420342566562@newsletter',
          },
        },
      }, { quoted: m });

    } catch (err) {
      console.error('AudD Error:', err);
      return sock.sendMessage(m.from, {
        text: `❌ *Failed to identify the track.*\n_Reason:_ ${err.message}`,
        contextInfo: {
          forwardingScore: 2,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: 'Popkid-Xmd',
            newsletterJid: '120363420342566562@newsletter',
          },
        },
      }, { quoted: m });
    }
  }
};
