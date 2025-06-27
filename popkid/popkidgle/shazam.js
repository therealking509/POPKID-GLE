import fs from 'fs';
import acrcloud from 'acrcloud';
import config from '../../config.cjs';

const acr = new acrcloud({
  host: 'identify-eu-west-1.acrcloud.com',
  access_key: 'fOeihi7UdMy3TSZ7F9NuNzM9JtB27wZac6csMPyb',
  access_secret: '88f64ffc32228ef99f61535fffef6c3b'
});

const streamToBuffer = async (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
};

const shazam = async (m, sock) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix)
      ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
      : '';
    const validCommands = ['shazam', 'hansfind', 'whatmusic'];
    if (!validCommands.includes(cmd)) return;

    if (!m.quoted) {
      return sock.sendMessage(m.from, {
        text: `🎧 *Music ID Request*\n\nPlease reply to an *audio*, *video*, or *music file* (e.g. .mp3) to identify the track.\n\n_Example:_ reply to a voice note or song with *.shazam*`,
        contextInfo: {
          forwardingScore: 5,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: "Popkid-Xmd",
            newsletterJid: "120363420342566562@newsletter",
          },
        }
      }, { quoted: m });
    }

    const mime = m.quoted?.mimetype || '';
    if (!mime) {
      return sock.sendMessage(m.from, {
        text: `❌ *Cannot detect file type.*\nPlease reply to a clear *audio* or *music video* file.`,
        contextInfo: {
          forwardingScore: 5,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: "Popkid-Xmd",
            newsletterJid: "120363420342566562@newsletter",
          }
        }
      }, { quoted: m });
    }

    const acceptableTypes = ['audio', 'video', 'application/octet-stream'];
    const isAcceptable = acceptableTypes.some(type => mime.startsWith(type));
    if (!isAcceptable) {
      return sock.sendMessage(m.from, {
        text: `🎧 *Music ID Request*\n\nQuoted file must be an *audio*, *video*, or *song file* (e.g. .mp3)\n_Example:_ reply to a voice note or song with *.shazam*`,
        contextInfo: {
          forwardingScore: 5,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: "Popkid-Xmd",
            newsletterJid: "120363290715861418@newsletter",
          },
        }
      }, { quoted: m });
    }

    const media = await m.quoted.download();
    if (!media) throw new Error('❌ Failed to download quoted media.');

    const buffer = Buffer.isBuffer(media) ? media : await streamToBuffer(media);
    if (buffer.length < 100000) throw new Error('⚠️ Audio sample is too short or unclear.');

    const filePath = `./tmp-${Date.now()}.mp3`;
    fs.writeFileSync(filePath, buffer);

    await sock.sendMessage(m.from, {
      text: '🔍 *Analyzing the audio...*\nPlease wait...',
      contextInfo: {
        forwardingScore: 5,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: "Popkid-Xmd",
          newsletterJid: "120363420342566562@newsletter",
        },
      }
    }, { quoted: m });

    const result = await acr.identify(fs.readFileSync(filePath));
    fs.unlinkSync(filePath); // Cleanup

    const { code, msg } = result.status;
    if (code !== 0 || !result.metadata?.music?.length) {
      throw new Error(msg || '❌ No match found.');
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

    const resultText = 
      `🎶 *TRACK FOUND!*\n\n` +
      `• 📌 *Title:* ${title || 'Unknown'}\n` +
      `• 👤 *Artist:* ${artists?.map(a => a.name).join(', ') || 'Unknown'}\n` +
      `• 💿 *Album:* ${album?.name || 'Unknown'}\n` +
      `• 🎼 *Genre:* ${genres?.map(g => g.name).join(', ') || 'Unknown'}\n` +
      `• 📅 *Release:* ${release_date || 'Unknown'}\n\n` +
      (youtube ? `▶️ *YouTube:* https://youtu.be/${youtube}\n` : '') +
      (spotify ? `🎧 *Spotify:* ${spotify}\n` : '') +
      `\n✅ _Powered by ACRCloud_`;

    await sock.sendMessage(m.from, {
      text: resultText,
      contextInfo: {
        forwardingScore: 5,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: "Popkid-Xmd",
          newsletterJid: "120363420342566562@newsletter",
        },
      }
    }, { quoted: m });

  } catch (err) {
    console.error('Shazam Error:', err);
    await sock.sendMessage(m.from, {
      text: `⚠️ *Music not identified.*\n_${err.message || 'Please try again with a better audio file.'}_`,
      contextInfo: {
        forwardingScore: 5,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: "Popkid-Xmd",
          newsletterJid: "120363420342566562@newsletter",
        },
      }
    }, { quoted: m });
  }
};

export default shazam;
