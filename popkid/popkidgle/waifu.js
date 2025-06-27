import axios from 'axios';
import config from '../../config.cjs';

const imageAPIs = {
  waifu: {
    url: "https://api.waifu.pics/sfw/waifu",
    caption: "💖 Here is your waifu image!"
  },
  neko: {
    url: "https://api.waifu.pics/sfw/neko",
    caption: "😺 Here is your neko image!"
  },
  shinobu: {
    url: "https://api.waifu.pics/sfw/shinobu",
    caption: "🟡 Here is your Shinobu image!"
  },
  megumin: {
    url: "https://api.waifu.pics/sfw/megumin",
    caption: "🔥 Here is your Megumin image!"
  },
  coupledp: {
    url: "https://fantox-cosplay-api.onrender.com/",
    caption: "💑 *ᴘᴏᴘᴋɪᴅ ʙᴏᴛ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴛᴇᴀᴍ ᴘᴏᴘᴋɪᴅ*",
    customKey: "image"
  }
};

const botCommands = async (m, sock) => {
  const prefix = config.PREFIX;
  const body = m.body || '';
  const command = body.startsWith(prefix) ? body.slice(prefix.length).split(" ")[0].toLowerCase() : '';

  // 🖼 Show available image commands
  if (command === 'imagecmds' || command === 'piccmds') {
    const commandList = Object.keys(imageAPIs)
      .map(cmd => `◽ *${prefix}${cmd}*`)
      .join('\n');

    const listText = `📸 *Image Commands Available:*\n\n${commandList}\n\n✨ Use *${prefix}waifu*, *${prefix}neko*, etc.\n👑 _Bot by Team Popkid_`;

    await sock.sendMessage(
      m.from,
      { text: listText },
      {
        quoted: m,
        contextInfo: {
          forwardedNewsletterMessageInfo: {
            newsletterName: "Popkid-Xmd",
            newsletterJid: "120363290715861418@newsletter"
          }
        }
      }
    );
    return;
  }

  // 📸 Handle image command
  if (Object.keys(imageAPIs).includes(command)) {
    await m.React('⏳');

    try {
      const cmdData = imageAPIs[command];
      const res = await axios.get(cmdData.url);
      const imageUrl = cmdData.customKey ? res.data[cmdData.customKey] : res.data.url;

      if (imageUrl) {
        await sock.sendMessage(
          m.from,
          {
            image: { url: imageUrl },
            caption: cmdData.caption
          },
          {
            quoted: m,
            contextInfo: {
              forwardedNewsletterMessageInfo: {
                newsletterName: "Popkid-Xmd",
                newsletterJid: "120363290715861418@newsletter"
              }
            }
          }
        );
      } else {
        await sock.sendMessage(
          m.from,
          { text: `❌ Couldn't fetch *${command}* image. Please try again later.` },
          {
            quoted: m,
            contextInfo: {
              forwardedNewsletterMessageInfo: {
                newsletterName: "Popkid-Xmd",
                newsletterJid: "120363290715861418@newsletter"
              }
            }
          }
        );
      }
    } catch (e) {
      console.error(`Error fetching ${command}:`, e);
      await sock.sendMessage(
        m.from,
        { text: `⚠️ An error occurred while fetching *${command}* image.` },
        {
          quoted: m,
          contextInfo: {
            forwardedNewsletterMessageInfo: {
              newsletterName: "Popkid-Xmd",
              newsletterJid: "120363290715861418@newsletter"
            }
          }
        }
      );
    }
  }
};

export default botCommands;
