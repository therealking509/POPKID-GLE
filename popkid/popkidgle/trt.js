import config from '../../config.cjs';
import translate from '@vitalets/google-translate-api'; // npm install @vitalets/google-translate-api

const translateText = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const body = m.body.slice(prefix.length + cmd.length).trim();
  const args = body.split(" ");

  if (cmd === "trt") {
    if (!body) {
      const usage = `❓ *Missing input text!*

📌 *Usage:* 
\`\`\`${prefix + cmd} <language> <text>\`\`\`

💡 *Example:* 
\`\`\`${prefix + cmd} ja Yo wassup\`\`\`

🌐 *List of Languages:* 
https://cloud.google.com/translate/docs/languages

🔹 *Powered by Popkid GLE Bot*
`;
      return sock.sendMessage(m.from, { text: usage }, { quoted: m });
    }

    const defaultLang = 'en';
    let lang = args[0];
    let inputText = args.slice(1).join(" ");

    if ((lang || '').length !== 2) {
      lang = defaultLang;
      inputText = args.join(" ");
    }

    if (!inputText && m.quoted?.text) inputText = m.quoted.text;

    try {
      const result = await translate(inputText, {
        to: lang,
        autoCorrect: true,
      });

      const styledReply = `🌍 *Translation Result*
━━━━━━━━━━━━━━
🔸 *From:* \`${result.from.language.iso.toUpperCase()}\`
🔹 *To:* \`${lang.toUpperCase()}\`

📝 *Original:* 
_${inputText}_

✅ *Translated:* 
*${result.text}*

━━━━━━━━━━━━━━
⚡ *Powered by Popkid GLE Bot*
`;

      sock.sendMessage(m.from, { text: styledReply }, { quoted: m });
    } catch (err) {
      console.error("Translation error:", err);
      const errorText = `❌ *Translation failed.*\n\nMake sure you're using a valid language code.\n\n🌐 List: https://cloud.google.com/translate/docs/languages\n\n⚡ *Popkid GLE Bot*`;
      return sock.sendMessage(m.from, { text: errorText }, { quoted: m });
    }
  }
};

export default translateText;
