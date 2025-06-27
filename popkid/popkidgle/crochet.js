import axios from 'axios';
import config from '../../config.cjs';

const chatbotcommand = async (m, Matrix) => {
  const botNumber = await Matrix.decodeJid(Matrix.user.id);
  const isCreator = [botNumber, `${config.OWNER_NUMBER}@s.whatsapp.net`].includes(m.sender);
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  // Toggle chatbot
  if (cmd === 'chatbot') {
    if (!isCreator) return m.reply('❌ *Access Denied*\n_Only bot owner can toggle this feature._');
    let resMsg;

    if (text === 'on') {
      config.CHATBOT = true;
      resMsg = '🤖 Chatbot has been *enabled*. I\'m now live!';
    } else if (text === 'off') {
      config.CHATBOT = false;
      resMsg = '🔕 Chatbot has been *disabled*. I\'ll stay silent.';
    } else {
      resMsg = `💡 *Chatbot Usage:*\n\n• ${prefix}chatbot on\n• ${prefix}chatbot off`;
    }

    return await Matrix.sendMessage(m.from, {
      text: resMsg,
      contextInfo: {
        forwardingScore: 10,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363420342566562@newsletter',
          newsletterName: 'Popkid-Xmd'
        }
      }
    }, { quoted: m });
  }

  // ─── Groq Chatbot Logic ─────────────────
  if (config.CHATBOT) {
    const mek = m;
    if (!mek.message || mek.key.fromMe) return;

    const from = mek.key.remoteJid;
    const sender = mek.key.participant || from;
    const isGroup = from.endsWith('@g.us');
    const msgText = mek.body || '';

    if (isGroup) {
      const mentioned = mek.message?.extendedTextMessage?.contextInfo?.mentionedJid?.includes(Matrix.user.id);
      const quotedYou = mek.message?.extendedTextMessage?.contextInfo?.participant === Matrix.user.id;
      const repliedToYou = mek.message?.extendedTextMessage?.contextInfo?.stanzaId && quotedYou;
      if (!mentioned && !quotedYou && !repliedToYou) return;
    }

    global.userChats = global.userChats || {};
    global.userChats[sender] = global.userChats[sender] || [];

    global.userChats[sender].push(`👤 User: ${msgText}`);
    if (global.userChats[sender].length > 15) global.userChats[sender].shift();

    const chatHistory = global.userChats[sender].join('\n');
    const prompt = `
You are *Popkid-Gle*, a smart and helpful AI WhatsApp bot created by Popkid-Xmd. Your job is to provide accurate, conversational, and friendly responses.

🧠 *Chat History:*
${chatHistory}
    `;

    try {
      const { data } = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: msgText }
        ]
      }, {
        headers: {
          Authorization: `Bearer ${config.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      });

      const botReply = data.choices?.[0]?.message?.content || '🤖 Sorry, I didn’t get that.';
      global.userChats[sender].push(`🤖 Bot: ${botReply}`);

      await Matrix.sendMessage(from, {
        text: botReply,
        contextInfo: {
          forwardingScore: 5,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363420342566562@newsletter',
            newsletterName: 'Popkid-Xmd'
          }
        }
      }, { quoted: mek });

    } catch (err) {
      console.error('Groq error:', err.response?.data || err.message);
      await Matrix.sendMessage(m.from, {
        text: '⚠️ Error getting response from chatbot.',
        contextInfo: {
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363420342566562@newsletter',
            newsletterName: 'Popkid-Xmd'
          }
        }
      }, { quoted: m });
    }
  }
};

export default chatbotcommand;
