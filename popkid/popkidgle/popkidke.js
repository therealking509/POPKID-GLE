import config from '../../config.cjs';
import ytSearch from 'yt-search';

const play = async (message, client) => {
  const prefix = config.PREFIX;
  const cmd = message.body.startsWith(prefix) 
    ? message.body.slice(prefix.length).split(" ")[0].toLowerCase() 
    : '';
  const query = message.body.slice(prefix.length + cmd.length).trim();

  if (cmd === 'play3') {
    if (!query) return message.reply("❌ Please provide a search query!");
    await message.React('🎧');

    try {
      const searchResults = await ytSearch(query);
      if (!searchResults.videos.length) return message.reply("❌ No results found!");

      const video = searchResults.videos[0];
      const caption = `
✞︎😇😇𝗣𝗢𝗣𝗞𝗜𝗗 𝗚𝗟𝗘😇😇✞︎

┃▸ Title: ${video.title}
┃▸ Duration: ${video.timestamp}
┃▸ Views: ${video.views}
┃▸ Channel: ${video.author.name}

╰━━━━━━━━━━━━━━━━━━

Reply with any option:

1️⃣ Video  
2️⃣ Audio  
3️⃣ Video (Document)  
4️⃣ Audio (Document)
`;

      const newsletterContext = {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: "ᴘᴏᴘᴋɪᴅ ɢʟᴇ",
          newsletterJid: "120363420342566562@newsletter"
        }
      };

      const optionsMsg = await client.sendMessage(message.from, {
        image: { url: video.thumbnail },
        caption: caption.trim(),
        contextInfo: newsletterContext
      }, { quoted: message });

      const optionsMsgId = optionsMsg.key.id;
      const videoUrl = video.url;

      client.ev.on('messages.upsert', async ({ messages }) => {
        const response = messages[0];
        if (!response.message) return;

        const selectedOption = response.message.conversation || 
                             response.message.extendedTextMessage?.text;
        const chatJid = response.key.remoteJid;
        const isResponseToOptions = response.message.extendedTextMessage?.contextInfo?.stanzaId === optionsMsgId;

        if (isResponseToOptions) {
          await client.sendMessage(chatJid, { 
            react: { text: '🤳', key: response.key } 
          });

          let apiUrl, format, mimeType, responseText;

          switch (selectedOption) {
            case '1':
              apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp4?url=${videoUrl}`;
              format = "video";
              responseText = "🎟️ Downloaded in Video Format";
              break;
            case '2':
              apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp3?url=${videoUrl}`;
              format = "audio";
              mimeType = "audio/mpeg";
              responseText = "✔️ Downloaded in Audio Format";
              break;
            case '3':
              apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp4?url=${videoUrl}`;
              format = "document";
              mimeType = "video/mp4";
              responseText = "🏁 Downloaded as Video Document";
              break;
            case '4':
              apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp3?url=${videoUrl}`;
              format = "document";
              mimeType = "audio/mpeg";
              responseText = "🤖 Downloaded as Audio Document";
              break;
            default:
              return message.reply("❌ Invalid selection! Please reply with 1, 2, 3, or 4.");
          }

          // Simulate a progress bar
          const processingMsg = await client.sendMessage(chatJid, { 
            text: `🔄 Processing your request...\n\n[                    ] 0%`,
            quoted: response 
          });

          for (let i = 5; i <= 100; i += 5) {
            const progressBar = '█'.repeat(i / 5) + ' '.repeat(20 - i / 5);
            await client.sendMessage(chatJid, {
              edit: processingMsg.key,
              text: `🔄 Processing your request...\n\n[${progressBar}] ${i}%`
            });
            await new Promise(resolve => setTimeout(resolve, 150));
          }

          try {
            const apiResponse = await fetch(apiUrl);
            const data = await apiResponse.json();

            if (!data.success) {
              await client.sendMessage(chatJid, {
                edit: processingMsg.key,
                text: "❌ Download failed, please try again."
              });
              return;
            }

            const downloadUrl = data.result.download_url;
            const mediaMessage = {
              [format]: { url: downloadUrl },
              mimetype: mimeType,
              caption: responseText,
              contextInfo: newsletterContext
            };

            if (format === 'document') {
              mediaMessage.fileName = `PopkidGLE_${format}.${mimeType?.includes('video') ? 'mp4' : 'mp3'}`;
            }

            await client.sendMessage(chatJid, { delete: processingMsg.key });
            await client.sendMessage(chatJid, mediaMessage, { quoted: response });

          } catch (err) {
            console.error("Download error:", err);
            await client.sendMessage(chatJid, {
              edit: processingMsg.key,
              text: "❌ An error occurred during download."
            });
          }
        }
      });

    } catch (err) {
      console.error("Search error:", err);
      return message.reply("❌ An error occurred while searching.");
    }
  }
};

export default play;
