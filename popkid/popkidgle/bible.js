import config from '../../config.cjs';
import fetch from 'node-fetch';

const SUPPORTED_LANGUAGES = {
  en: 'English 🇺🇸',
  fr: 'French 🇫🇷',
  es: 'Spanish 🇪🇸',
  de: 'German 🇩🇪',
  pt: 'Portuguese 🇵🇹',
  it: 'Italian 🇮🇹',
  hi: 'Hindi 🇮🇳',
};

const getTranslatedText = async (text, targetLang) => {
  const res = await fetch('https://libretranslate.de/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: text,
      source: 'en',
      target: targetLang,
      format: 'text',
    }),
  });

  const data = await res.json();
  return data.translatedText || text;
};

const showLanguageMenu = () => {
  const list = Object.entries(SUPPORTED_LANGUAGES)
    .map(([code, name]) => `• \`--lang=${code}\` → ${name}`)
    .join('\n');

  return `
🌐 *Supported Languages:*
${list}
`.trim();
};

const bible = async (m, sock) => {
  const prefix = config.PREFIX;
  const command = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  const query = m.body.slice(prefix.length + command.length).trim();

  if (command !== 'bible') return;

  // Parse language
  const langMatch = query.match(/--lang=([a-z]{2})/i);
  const lang = langMatch ? langMatch[1].toLowerCase() : 'en';
  const verseQuery = query.replace(/--lang=([a-z]{2})/i, '').trim();

  if (!verseQuery) {
    return sock.sendMessage(m.from, {
      text: `📖 *Usage:* \`.bible John 3:16 --lang=fr\`\n\n${showLanguageMenu()}`
    }, { quoted: m });
  }

  if (!SUPPORTED_LANGUAGES[lang]) {
    return sock.sendMessage(m.from, {
      text: `❌ *Unsupported language code:* \`${lang}\`\n\n${showLanguageMenu()}`
    }, { quoted: m });
  }

  // Start response timer and send typing reaction
  const startTime = Date.now();
  await sock.sendMessage(m.from, { react: { text: '⏳', key: m.key } });

  try {
    const apiUrl = `https://bible-api.com/${encodeURIComponent(verseQuery)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    const responseTime = Date.now() - startTime;

    if (data.error) {
      return sock.sendMessage(m.from, {
        text: `❌ *Error:* ${data.error}`
      }, { quoted: m });
    }

    let verseText = data.text.trim();
    const reference = data.reference;

    if (lang !== 'en') {
      verseText = await getTranslatedText(verseText, lang);
    }

    const formatted = `
╭─⧉ *Bible Verse Lookup*
│
│ 📚 *Reference:* ${reference}
│ 🌐 *Language:* ${SUPPORTED_LANGUAGES[lang]}
│ 🕊️ *Verse:* 
│ ${verseText.split('\n').map(line => `│ ${line}`).join('\n')}
│
│ ⏱️ *Fetched in:* ${responseTime}ms
╰────⟡ bible-api.com + libretranslate.de
    `.trim();

    await sock.sendMessage(m.from, {
      text: formatted
    }, { quoted: m });

    await sock.sendMessage(m.from, { react: { text: '✅', key: m.key } });

  } catch (err) {
    console.error('[Bible Command Error]', err.message);
    await sock.sendMessage(m.from, {
      text: '❌ *An error occurred while fetching or translating the verse.*'
    }, { quoted: m });
    await sock.sendMessage(m.from, { react: { text: '⚠️', key: m.key } });
  }
};

export default bible;
