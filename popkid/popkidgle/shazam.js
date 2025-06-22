import fs from 'fs';
import acrcloud from 'acrcloud';
import config from '../../config.cjs';

const acr = new acrcloud({
  host: 'identify-eu-west-1.acrcloud.com',
  access_key: '716b4ddfa557144ce0a459344fe0c2c9',
  access_secret: 'Lz75UbI8g6AzkLRQgTgHyBlaQq9YT5wonr3xhFkf'
});

const shazam = async (m, gss, sock) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix)
      ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
      : '';

    const validCommands = ['shazam', 'hansfind', 'whatmusic'];
    if (!validCommands.includes(cmd)) return;

    const quoted = m.quoted || {};
    const mime =
      quoted?.mimetype ||
      quoted?.msg?.mimetype ||
      quoted?.documentMessage?.mimetype ||
      '';

    const isMedia =
      quoted?.audioMessage ||
      quoted?.videoMessage ||
      (quoted?.documentMessage && mime.startsWith('audio')) ||
      mime.startsWith('audio') ||
      mime.startsWith('video');

    if (!quoted || !isMedia) {
      return sock.sendMessage(m.from, {
        text:
          `🎧 *Music ID Request*\n\n` +
          `Please quote an *audio*, *video*, or *music file* to identify its song.\n\n` +
          `_Example:_ Reply to a voice note, video, or song with:\n*${prefix}shazam*`,
        contextInfo: {
          forwardingScore: 5,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: 'Popkid-Xmd',
            newsletterJid: '120363290715861418@newsletter'
          }
        }
      }, { quoted: m });
    }

    const media = await quoted.download();
    const filePath = `./tmp-${Date.now()}.mp3`;
    fs.writeFileSync(filePath, media);

    await sock.sendMessage(m.from, {
      text: '🔍 *Identifying the track...*\nPlease wait...',
      contextInfo: {
        forwardingScore: 5,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: 'Popkid-Xmd',
          newsletterJid: '120363290715861418@newsletter'
        }
      }
    }, { quoted: m });

    const result = await acr.identify(fs.readFileSync(filePath));
    fs.unlinkSync(filePath); // Cleanup

    const { code, msg } = result.status;
    if (code !== 0 || !result.metadata?.music?.length) {
      throw new Error(msg || 'No match found');
    }

    const music = result.metadata.music[0];
    const {
      title,
      artists,
      album,
      genres,
      release_date,
      external_metadata
    } = music;

    const youtube = external_metadata?.youtube?.vid;
    const spotify = external_metadata?.spotify?.track?.external_urls?.spotify;

    const response =
      `🎶 *TRACK IDENTIFIED!*\n\n` +
      `• 📌 *Title:* ${title || 'Unknown'}\n` +
      `• 👤 *Artist:* ${artists?.map(a => a.name).join(', ') || 'Unknown'}\n` +
      `• 💿 *Album:* ${album?.name || 'Unknown'}\n` +
      `• 🎼 *Genre:* ${genres?.map(g => g.name).join(', ') || 'Unknown'}\n` +
      `• 📅 *Release:* ${release_date || 'Unknown'}\n\n` +
      (youtube ? `▶️ *YouTube:* https://youtu.be/${youtube}\n` : '') +
      (spotify ? `🎧 *Spotify:* ${spotify}\n` : '') +
      `\n✅ _Powered by ACRCloud_`;

    await sock.sendMessage(m.from, {
      text: response.trim(),
      contextInfo: {
        forwardingScore: 5,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: 'Popkid-Xmd',
          newsletterJid: '120363290715861418@newsletter'
        }
      }
    }, { quoted: m });
  } catch (err) {
    console.error('Shazam Error:', err);
    await sock.sendMessage(m.from, {
      text: '⚠️ *Error identifying the music.*\nPlease try again with a longer or clearer audio clip.',
      contextInfo: {
        forwardingScore: 5,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: 'Popkid-Xmd',
          newsletterJid: '120363290715861418@newsletter'
        }
      }
    }, { quoted: m });
  }
};

export default shazam;
