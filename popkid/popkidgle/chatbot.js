import axios from 'axios';
import config from '../../config.cjs';

const chatbotcommand = async (m, Matrix) => {
    const botNumber = await Matrix.decodeJid(Matrix.user.id);
    const isCreator = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    // Handle the chatbot command (toggle)
    if (cmd === 'chatbot') {
        if (!isCreator) return m.reply("*Only admin can use this command.*");

        let responseMessage;

        if (text === 'on') {
            config.CHATBOT = true;
            responseMessage = "✅ Chatbot has been *enabled*.";
        } else if (text === 'off') {
            config.CHATBOT = false;
            responseMessage = "❌ Chatbot has been *disabled*.";
        } else {
            responseMessage = "🧠 *Chatbot Usage:*\n\n- `.chatbot on`: Enable chatbot\n- `.chatbot off`: Disable chatbot";
        }

        try {
            await Matrix.sendMessage(m.from, { text: responseMessage }, { quoted: m });
        } catch (error) {
            console.error("Error sending chatbot command response:", error);
            await Matrix.sendMessage(m.from, { text: '❌ Failed to process your request.' }, { quoted: m });
        }

        return; // ✅ Stop further processing if this was a chatbot command
    }

    // Handle chatbot auto-replies only if enabled
    if (config.CHATBOT) {
        const mek = m;
        if (!mek.message || mek.key.fromMe) return;

        const from = mek.key.remoteJid;
        const sender = mek.key.participant || from;
        const isGroup = from.endsWith('@g.us');
        const msgText = mek.body || '';

        // Only respond in group if bot is mentioned, quoted, or replied to
        if (isGroup) {
            const contextInfo = mek.message?.extendedTextMessage?.contextInfo;
            const isMentioned = contextInfo?.mentionedJid?.includes(Matrix.user.id);
            const isQuoted = contextInfo?.participant === Matrix.user.id;
            const isReplied = contextInfo?.stanzaId && contextInfo?.participant === Matrix.user.id;

            if (!isMentioned && !isQuoted && !isReplied) return;
        }

        // Initialize global user history storage
        if (!global.userChats) global.userChats = {};
        if (!global.userChats[sender]) global.userChats[sender] = [];

        // Save user message to history
        global.userChats[sender].push(`User: ${msgText}`);
        if (global.userChats[sender].length > 15) global.userChats[sender].shift();

        const userHistory = global.userChats[sender].join("\n");

        // Create chatbot prompt with conversation history
        const prompt = `
You are popkid-gle, a helpful and friendly WhatsApp bot.

### Conversation History:
${userHistory}
        `;

        try {
            const { data } = await axios.get("https://mannoffc-x.hf.space/ai/logic", {
                params: { q: msgText, logic: prompt }
            });

            const botResponse = data.result;

            // Add bot response to conversation history
            global.userChats[sender].push(`Bot: ${botResponse}`);

            // Send chatbot reply
            await Matrix.sendMessage(from, { text: botResponse }, { quoted: mek });

        } catch (error) {
            console.error("Error in chatbot response:", error);
            await Matrix.sendMessage(from, { text: '❌ Chatbot failed to respond.' }, { quoted: m });
        }
    }
};

export default chatbotcommand;
