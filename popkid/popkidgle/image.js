import axios from 'axios';
import config from '../../config.cjs';

global.nex_key = 'https://api.nexoracle.com';
global.nex_api = 'free_key@maher_apis';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const imageCommand = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  let query = m.body.slice(prefix.length + cmd.length).trim();

  const validCommands = ['image', 'img', 'gimage'];
  if (!validCommands.includes(cmd)) return;

  if (!query && !(m.quoted && m.quoted.text)) {
    return sock.sendMessage(m.from, {
      text:
        `╭━━〔 *🖼️ IMAGE SEARCH* 〕━━╮\n` +
        `┃ ❌ No query provided.\n` +
        `┃ 💡 Example: *${prefix + cmd} neon skull*\n` +
        `╰━━━━━━━━━━━━━━━━━━━━╯`,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363290715861418@newsletter",
          newsletterName: "Popkid-Xmd"
        }
      }
    });
  }

  if (!query && m.quoted && m.quoted.text) {
    query = m.quoted.text;
  }

  try {
    await sock.sendMessage(m.from, {
      text: `🔍 *Searching for:* _${query}_\n\n🕒 Please wait while I fetch images...`,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363290715861418@newsletter",
          newsletterName: "Popkid-Xmd"
        }
      }
    });

    const endpoint = `${global.nex_key}/search/google-image?apikey=${global.nex_api}&q=${encodeURIComponent(query)}`;
    const response = await axios.get(endpoint);

    if (response.status === 200 && response.data.result && response.data.result.length > 0) {
      const images = response.data.result.slice(0, 5);

      for (let i = 0; i < images.length; i++) {
        await sleep(500);
        await sock.sendMessage(
          m.from,
          {
            image: { url: images[i] },
            caption: `🖼️ *Image ${i + 1}/${images.length}*\n🔎 _${query}_`,
            contextInfo: {
              forwardingScore: 999,
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: "120363290715861418@newsletter",
                newsletterName: "Popkid-Xmd"
              }
            }
          },
          { quoted: m }
        );
      }

      await m.react("✅");
    } else {
      throw new Error('No images found');
    }
  } catch (error) {
    console.error("Image Fetch Error:", error);
    await sock.sendMessage(m.from, {
      text:
        `╭───〔 *❌ SEARCH FAILED* 〕───╮\n` +
        `┃ ❗ Unable to fetch images.\n` +
        `┃ 💬 Error: ${error.message || error}\n` +
        `┃ 🔁 Please try again later.\n` +
        `╰──────────────────────────╯`,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363290715861418@newsletter",
          newsletterName: "Popkid-Xmd"
        }
      }
    });
  }
};

export default imageCommand;
