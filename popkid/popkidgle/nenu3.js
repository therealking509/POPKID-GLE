import config from '../../config.cjs';

const fontify = (text) =>
  text.replace(/[A-Za-z]/g, (char) => {
    const isUpper = char >= 'A' && char <= 'Z';
    const base = isUpper ? 0x1D5A0 : 0x1D5BA;
    return String.fromCodePoint(base + char.toLowerCase().charCodeAt(0) - 97);
  });

const menuSections = {
  1: `
╭──〔 🛠️ *${fontify("System Menu")}* 〕──◆
│⎘ ${config.PREFIX}${fontify("menu")}
│✅ ${config.PREFIX}${fontify("alive")}
│🧑‍💻 ${config.PREFIX}${fontify("owner")}
│📍 ${config.PREFIX}${fontify("ping")}
╰───────────────────────◆`,
  2: `
╭──〔 👑 *${fontify("Owner Tools")}* 〕──◆
│🔒 ${config.PREFIX}${fontify("block")}
│🔓 ${config.PREFIX}${fontify("unblock")}
│📤 ${config.PREFIX}${fontify("join")}
│📥 ${config.PREFIX}${fontify("leave")}
│🧃 ${config.PREFIX}${fontify("autolikestatus")}
│🧬 ${config.PREFIX}${fontify("autobio")}
│👨‍💻 ${config.PREFIX}${fontify("setppbot")}
│📛 ${config.PREFIX}${fontify("setstatus")}
│✏️ ${config.PREFIX}${fontify("setnamebot")}
╰───────────────────────◆`,
  3: `
╭──〔 🧠 *${fontify("GPT / AI Zone")}* 〕──◆
│💬 ${config.PREFIX}${fontify("ai")}
│🤖 ${config.PREFIX}${fontify("gpt")}
│🖌️ ${config.PREFIX}${fontify("dalle")}
│📣 ${config.PREFIX}${fontify("chatbot")}
│🐞 ${config.PREFIX}${fontify("bug")}
│📝 ${config.PREFIX}${fontify("report")}
╰───────────────────────◆`,
  4: `
╭──〔 🎧 *${fontify("Media / Downloader")}* 〕──◆
│🎶 ${config.PREFIX}${fontify("play")}
│🎥 ${config.PREFIX}${fontify("video")}
│📸 ${config.PREFIX}${fontify("gimage")}
│💌 ${config.PREFIX}${fontify("attp")}
╰───────────────────────◆`,
  5: `
╭──〔 🔍 *${fontify("Search Tools")}* 〕──◆
│🌐 ${config.PREFIX}${fontify("google")}
│📄 ${config.PREFIX}${fontify("lyrics")}
│🎞️ ${config.PREFIX}${fontify("imdb")}
│📦 ${config.PREFIX}${fontify("mediafire")}
│📘 ${config.PREFIX}${fontify("facebook")}
│📸 ${config.PREFIX}${fontify("instagram")}
│🎵 ${config.PREFIX}${fontify("tiktok")}
╰───────────────────────◆`,
  6: `
╭──〔 🎭 *${fontify("Fun Tools")}* 〕──◆
│🖼️ ${config.PREFIX}${fontify("getpp")}
│🔗 ${config.PREFIX}${fontify("url")}
╰───────────────────────◆`,
};

const menu = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (/^[1-6]$/.test(m.body)) {
    const section = menuSections[m.body];
    if (section) {
      return m.reply(`📘 *${fontify("Section")} ${m.body}:*\n${section}`);
    }
  }

  if (cmd === "menu") {
    const start = Date.now();
    await m.React('📱');
    const responseTime = (Date.now() - start) / 1000;

    let profilePictureUrl = 'https://files.catbox.moe/kiy0hl.jpg';
    try {
      const pp = await sock.profilePictureUrl(m.sender, 'image');
      if (pp) profilePictureUrl = pp;
    } catch {}

    const mainMenu = `
╭━━━〔 *🤖 ${fontify(config.BOT_NAME)} - ${fontify("Menu Sections")}* 〕━━━◉
│✨ *${fontify("Bot Speed")}:* ${responseTime.toFixed(2)}s
│🚀 *${fontify("Version")}:* 7.1.0
│👑 *${fontify("Owner")}:* ${fontify(config.OWNER_NAME)}
╰━━━━━━━━━━━━━━━━━━━━━━━◉

${fontify("Reply with a number to view that section")}:
╭──〔 🗂️ ${fontify("Available Sections")} 〕──◆
│1️⃣ ${fontify("System Menu")}
│2️⃣ ${fontify("Owner Tools")}
│3️⃣ ${fontify("GPT / AI Zone")}
│4️⃣ ${fontify("Media / Downloader")}
│5️⃣ ${fontify("Search Tools")}
│6️⃣ ${fontify("Fun Tools")}
╰──────────────────────────◆

🧾 ${fontify("Uptime")}: Coming Soon...
📢 ${fontify("Developer")}: *Popkid-Xmd*
`.trim();

    await sock.sendMessage(m.from, {
      image: { url: profilePictureUrl },
      caption: mainMenu,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
          title: `${config.BOT_NAME} | ${fontify("Menu")}`,
          body: `Developed by ${config.OWNER_NAME}`,
          thumbnailUrl: profilePictureUrl,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: 'https://github.com/PopkidOfficial'
        }
      }
    }, { quoted: m });
  }
};

export default menu;
