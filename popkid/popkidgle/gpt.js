import axios from 'axios';
import config from '../config.cjs';
import { generateWAMessageFromContent } from '@whiskeysockets/baileys';

const command = {
  name: 'gpt',
  alias: [],
  description: 'Ask any question to GPT (via Groq LLaMA)',
  category: 'ai',
  usage: `${config.PREFIX}gpt [your question]`,

  start: async (m, ctx) => {
    const { sock, args, reply, from } = ctx;

    if (!args || args.length === 0) {
      return reply('🤖 *Hello!*\nWhat question would you like to ask me?\n\n_Example:_\n.gpt What is AI?');
    }

    const prompt = args.join(' ');

    try {
      const res = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama3-8b-8192', // ✅ Valid Groq model
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            Authorization: `Bearer ${config.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      const replyText = res.data?.choices?.[0]?.message?.content?.trim();
      if (!replyText) return reply("⚠️ I didn’t receive a valid response. Try again later.");

      const message = generateWAMessageFromContent(from, {
        message: {
          extendedTextMessage: {
            text: `💡 *GPT Response:*\n\n*You asked:* ${prompt}\n\n*Answer:*\n${replyText}`,
            contextInfo: {
              forwardingScore: 999,
              isForwarded: true,
              externalAdReply: {
                title: "GPT - Popkid AI",
                body: "🤖 Powered by LLaMA 3 via Groq",
                mediaType: 1,
                thumbnailUrl: "https://i.ibb.co/NymxRZH/ai-icon.png",
                sourceUrl: "https://groq.com",
                renderLargerThumbnail: true
              },
              forwardedNewsletterMessageInfo: {
                newsletterJid: "120363290715861418@newsletter",
                newsletterName: "Popkid-Xmd"
              }
            }
          }
        }
      }, {});

      await sock.relayMessage(from, message.message, { messageId: message.key.id });

    } catch (e) {
      console.error('❌ GPT Error:', e.response?.data || e.message);
      return reply('🚫 *GPT Request Failed!*\nPlease check your API key or try again later.');
    }
  }
};

export default command;
