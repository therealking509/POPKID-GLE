import config from '../../config.cjs';
import axios from 'axios';
import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';

const menu = {
  nomCom: 'gpt',
  reaction: '🤖',
  categorie: 'ai',
  handler: async (m, Matrix, { repondre, arg }) => {
    if (!arg || !arg[0]) {
      return repondre(
        '🤖 *Hello! Ask me anything.*\n\n📌 Example:\n.gpt What is Quantum Computing?'
      );
    }

    const prompt = arg.join(' ');
    const apiKey = config.GROQ_API_KEY;
    const model = 'llama3-8b-8192';

    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const replyText = response.data?.choices?.[0]?.message?.content?.trim();

      if (!replyText) {
        return repondre('⚠️ GPT returned no response. Please try again.');
      }

      const msg = generateWAMessageFromContent(m.chat, {
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363290715861418@newsletter',
          newsletterName: 'Popkid-Xmd',
          serverMessageId: '',
        },
        message: {
          extendedTextMessage: {
            text: `╭━━⬣ 🧠 *GPT AI Response* ⬣━━╮\n\n📩 *Prompt:* ${prompt}\n\n💬 *Answer:*\n${replyText}\n\n╰━━━⬣ Powered by Popkid-Xmd`,
            contextInfo: {
              externalAdReply: {
                title: '🤖 Popkid GPT',
                body: 'Ask me anything!',
                thumbnailUrl: 'https://telegra.ph/file/75bc4527c4cdb821efafa.jpg',
                sourceUrl: 'https://github.com/popkidgle',
                mediaType: 1,
                renderLargerThumbnail: true,
              }
            }
          }
        }
      }, {});

      await Matrix.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

    } catch (err) {
      console.error('[GPT ERROR]', err.message);
      return repondre(
        `🚫 *GPT Request Failed!*\n\n💥 *Reason:* ${err?.response?.data?.error?.message || err.message}`
      );
    }
  }
};

export default menu;
