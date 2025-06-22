import config from '../../config.cjs';
import axios from 'axios';
import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';

const menu = {
  nomCom: 'gpt',
  reaction: '🤖',
  categorie: 'ai',
  handler: async (m, Matrix, { repondre, arg }) => {
    console.log('[GPT] Handler called with args:', arg);

    if (!arg || arg.length === 0) {
      console.log('[GPT] No prompt provided');
      return repondre('🤖 *Please type a question after .gpt*');
    }

    const prompt = arg.join(' ');
    console.log('[GPT] Prompt:', prompt);

    const apiKey = config.GROQ_API_KEY;
    const model = 'llama3-8b-8192';

    try {
      console.log('[GPT] Sending request to Groq API...');
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model,
          messages: [{ role: 'user', content: prompt }],
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

      console.log('[GPT] API response received:', response.status);
      const replyText = response.data?.choices?.[0]?.message?.content?.trim();
      console.log('[GPT] replyText:', replyText);

      if (!replyText) {
        console.log('[GPT] No reply from model');
        return repondre('⚠️ GPT returned no content.');
      }

      const msg = generateWAMessageFromContent(m.chat, {
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363290715861418@newsletter',
          newsletterName: 'Popkid-Xmd',
          serverMessageId: ''
        },
        message: {
          extendedTextMessage: {
            text: `⚡ *GPT Answer*\n\n📝 *${prompt}*\n\n▶️ ${replyText}`,
            contextInfo: {
              externalAdReply: {
                title: 'Popkid GPT',
                body: 'Powered by Groq 🧠',
                thumbnailUrl: 'https://telegra.ph/file/75bc4527c4cdb821efafa.jpg',
                sourceUrl: 'https://github.com/popkidgle',
                mediaType: 1,
                renderLargerThumbnail: true
              }
            }
          }
        }
      }, {});

      await Matrix.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
      console.log('[GPT] Message relayed');

    } catch (err) {
      console.error('[GPT ERROR]', err.response?.data || err.message);
      return repondre(`🚫 *GPT Error*\n${err.response?.data?.error?.message || err.message}`);
    }
  }
};

export default menu;
