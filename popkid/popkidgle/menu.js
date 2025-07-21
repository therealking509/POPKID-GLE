import config from '../../config.cjs';

const menu = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "menu") {
    const start = new Date().getTime();
    await m.React('🪆');
    const end = new Date().getTime();

    let profilePictureUrl = 'https://files.catbox.moe/kiy0hl.jpg';
    try {
      const pp = await sock.profilePictureUrl(m.sender, 'image');
      if (pp) profilePictureUrl = pp;
    } catch (err) {
      console.log("Profile Picture Error:", err);
    }

    const newsletterContext = {
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterName: "ᴘᴏᴘᴋɪᴅ ɢʟᴇ",
        newsletterJid: "120363420342566562@newsletter"
      }
    };

    const menuText = `

══════════════════════
> 🌟  *😇𝗣𝗢𝗣𝗞𝗜𝗗 𝗚𝗟𝗘😇* 🌟
> *𝗩𝗲𝗿𝘀𝗶𝗼𝗻*: 7.1.0 |
> *ᴍᴀᴅᴇ ʙʏ ᴅᴇᴠ ᴘᴏᴘᴋɪᴅ🪆*
> *ULTRA SPEED ⚡ ⚡
══════════════════════

_✨ *𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 𝗠𝗘𝗡𝗨* ✨_
> *Explore the commands below to harness the bot's full power!*

═════════════════════
   🌍  *𝗦𝗬𝗦𝗧𝗘𝗠 𝗠𝗘𝗡𝗨* 🌍
═════════════════════
| ⚡ | ${prefix}menu
| 🟢 | ${prefix}alive
| 🛠️ | ${prefix}owner
| 🧠 | ${prefix}ping
| 💠 | ${prefix}mode
| 🌀 | ${prefix}sessioncheck
| 🚫 | ${prefix}alwaysonline
| 🔒 | ${prefix}antidelete
| 🔗 | ${prefix}antilink
| 📞 | ${prefix}anticall
| 🚧 | ${prefix}antispam
| ✍️ | ${prefix}autotyping
| 🎥 | ${prefix}autorecording
| 👁️ | ${prefix}autostatusview
| ❤️ | ${prefix}autoreact
| 🎟️ | ${prefix}addprem
| 💬 | ${prefix}statusreply
| 🕐 | ${prefix}waitfor
═════════════════════

═════════════════════
   👑  *𝗢𝗪𝗡𝗘𝗥 𝗣𝗔𝗚𝗘* 👑
═════════════════════
| 🎮 | ${prefix}join
| 🚪 | ${prefix}leave
| 🩷 | ${prefix}autobio
| 🔒 | ${prefix}block
| 🔒 | ${prefix}unblock
| 🧋 | ${prefix}autolikestatus
| 🤖 | ${prefix}setppbot
| 🛑 | ${prefix}setstatus
| 📝 | ${prefix}setnamebot
| 🧩 | ${prefix}repo
| 🧩 | ${prefix}setprefix
═════════════════════

═════════════════════
  🤖  *𝗚𝗣𝗧 𝗠𝗘𝗡𝗨* 🤖
═════════════════════
| 💬 | ${prefix}ai
| 🧠 | ${prefix}gpt
| 🧠 | ${prefix}whoai
| 🧠 | ${prefix}bible
| 🧠 | ${prefix}lmg
| 🧠 | ${prefix}chat
| 🐞 | ${prefix}bug
| 📝 | ${prefix}report
| 📝 | ${prefix}bugmenu
| 🚪 | ${prefix}chatbot
| 🎨 | ${prefix}dalle
═════════════════════

═════════════════════
 📦  *𝗖𝗢𝗡𝗩𝗘𝗥𝗧𝗘𝗥 & 𝗗𝗟𝗦* 📦
═════════════════════
| 🎶 | ${prefix}attp
| 🎬 | ${prefix}gimage
| 🎧 | ${prefix}play
| 🎧 | ${prefix}play2
| 🎧 | ${prefix}play3
| 🎧 | ${prefix}tomp3
| 📹 | ${prefix}video
| 📸 | ${prefix}url
| 📸 | ${prefix}ss
| 📲 | ${prefix}facebook
| 📲 | ${prefix}instagram
| 📲 | ${prefix}tiktok
| 📲 | ${prefix}ytmp3
═════════════════════

═════════════════════
   🔍  *𝗦𝗘𝗔𝗥𝗖𝗛 𝗠𝗘𝗡𝗨* 🔍
═════════════════════
| 🔎 | ${prefix}google
| 📽️ | ${prefix}mediafire
| 🎶 | ${prefix}lyrics
| 🎬 | ${prefix}imdb
═════════════════════

═════════════════════
   🔧  *𝗔𝗗𝗠𝗜𝗡 𝗧𝗢𝗢𝗟𝗦* 🔧
═════════════════════
| 🔹 | ${prefix}add
| 🔹 | ${prefix}kick
| 🔹 | ${prefix}promote
| 🔹 | ${prefix}demote
| 🔹 | ${prefix}hidetag
| 🔹 | ${prefix}tagall
| 🔹 | ${prefix}delete
| 🔹 | ${prefix}group
| 🔹 | ${prefix}groupinfo
| 🔹 | ${prefix}jid
| 🔹 | ${prefix}linkgc
| 🔹 | ${prefix}kickall
| 🔹 | ${prefix}removere
| 🔹 | ${prefix}left
| 🔹 | ${prefix}setdescription
| 🔹 | ${prefix}setgcname
| 🔹 | ${prefix}setpp
| 🔹 | ${prefix}blockcountry
| 🔹 | ${prefix}autoblockcountry
═════════════════════

═════════════════════
   ✨  *𝗧𝗘𝗫𝗧 & 𝗟𝗢𝗚𝗢 𝗦𝗧𝗬𝗟𝗘𝗦* ✨
═════════════════════
| 🖌️ | ${prefix}logo1-10
| 🖌️ | ${prefix}logo
| 🖌️ | ${prefix}grafikka
| 🖌️ | ${prefix}typography
| 🖌️ | ${prefix}paint
| 🖌️ | ${prefix}hacker
| 🖌️ | ${prefix}blackpink
| 🖌️ | ${prefix}glossyvulker
| 🖌️ | ${prefix}naruto
| 🖌️ | ${prefix}digitalglitch
| 🖌️ | ${prefix}pixelglitch
| 🖌️ | ${prefix}wafer
| 🖌️ | ${prefix}bulb
| 🖌️ | ${prefix}zodiacs
| 🖌️ | ${prefix}water3D
| 🖌️ | ${prefix}dragonfire
| 🖌️ | ${prefix}bookeh
| 🖌️ | ${prefix}queencard
| 🖌️ | ${prefix}birthdaycake
| 🖌️ | ${prefix}underwater
| 🖌️ | ${prefix}blue
| 🖌️ | ${prefix}wetglass
| 🖌️ | ${prefix}gemini
| 🖌️ | ${prefix}thunder
| 🖌️ | ${prefix}snow
| 🖌️ | ${prefix}textlight
| 🖌️ | ${prefix}sand
| 🖌️ | ${prefix}wall
═════════════════════

═════════════════════
   🎭  *𝗔𝗡𝗜𝗠𝗘 & 𝗥𝗘𝗔𝗖𝗧𝗜𝗢𝗡𝗦* 🎭
═════════════════════
| 💞 | ${prefix}cry
| 💞 | ${prefix}kiss
| 💞 | ${prefix}kill
| 💞 | ${prefix}hug
| 💞 | ${prefix}pat
| 💞 | ${prefix}lick
| 💞 | ${prefix}bite
| 💞 | ${prefix}yeet
| 💞 | ${prefix}bully
| 💞 | ${prefix}bonk
| 💞 | ${prefix}uwak
| 💞 | ${prefix}poke
| 💞 | ${prefix}nom
| 💞 | ${prefix}slap
| 💞 | ${prefix}smile
| 💞 | ${prefix}uday
| 💞 | ${prefix}awoo
| 💞 | ${prefix}blush
| 💞 | ${prefix}smug
| 💞 | ${prefix}dance
| 💞 | ${prefix}happy
| 💞 | ${prefix}sad
| 💞 | ${prefix}cringe
| 💞 | ${prefix}cuddle
| 💞 | ${prefix}shinobu
| 💞 | ${prefix}handhold
| 💞 | ${prefix}glomp
| 💞 | ${prefix}highfive
═════════════════════

═════════════════════
   🖌️  *𝗜𝗠𝗔𝗚𝗘 𝗘𝗙𝗙𝗘𝗖𝗧𝗦* 🖌️
═════════════════════
| 🎨 | ${prefix}sand3D
| 🎨 | ${prefix}blood
| 🎨 | ${prefix}galaxy
| 🎨 | ${prefix}gold
| 🎨 | ${prefix}team
| 🎨 | ${prefix}valanhine
| 🎨 | ${prefix}birthdayburst
| 🎨 | ${prefix}pubg
| 🎨 | ${prefix}halloween
| 🎨 | ${prefix}zodiac
| 🎨 | ${prefix}womenday
| 🎨 | ${prefix}avatar
| 🎨 | ${prefix}lucky
| 🎨 | ${prefix}tattoo
| 🎨 | ${prefix}vtuber
═════════════════════

═════════════════════
   🎧  *𝗔𝗨𝗗𝗜𝗢 𝗘𝗙𝗙𝗘𝗖𝗧𝗦* 🎧
═════════════════════
| 🎶 | ${prefix}sound7
| 🎶 | ${prefix}bass
| 🎶 | ${prefix}blown
| 🎶 | ${prefix}deep
| 🎶 | ${prefix}earrape
| 🎶 | ${prefix}fast
| 🎶 | ${prefix}fat
| 🎶 | ${prefix}nightcore
| 🎶 | ${prefix}reverse
| 🎶 | ${prefix}robot
| 🎶 | ${prefix}slow
| 🎶 | ${prefix}smooth
| 🎶 | ${prefix}tupai
═════════════════════

═════════════════════
   🧰  *𝗨𝗧𝗜𝗟𝗜𝗧𝗜𝗘𝗦* 🧰
═════════════════════
| 🧩 | ${prefix}repo
| 🧩 | ${prefix}gitclone
| 🧩 | ${prefix}githublstalk
| 🧩 | ${prefix}getpp
| 🧩 | ${prefix}sethng
| 🧩 | ${prefix}uphere
| 🧩 | ${prefix}pair
| 🧩 | ${prefix}host
| 🧩 | ${prefix}chid
| 🧩 | ${prefix}join
| 🧩 | ${prefix}open
═════════════════════

═════════════════════
   🎮  *𝗙𝗨𝗡 & 𝗚𝗔𝗠𝗘𝗦* 🎮
═════════════════════
| 🎉 | ${prefix}dare
| 🎉 | ${prefix}crochet
| 🎉 | ${prefix}love
| 🎉 | ${prefix}lyrics
| 🎉 | ${prefix}zodiac
| 🎉 | ${prefix}wetama
═════════════════════

🌟 *Bot made with ❤️ by Popkid*
❣️ *Powered by: Popkid-Gle Engine*
🙏 *For support, type:* ${prefix}support
`;

    await sock.sendMessage(m.from, {
      image: { url: profilePictureUrl },
      caption: menuText.trim(),
      contextInfo: newsletterContext
    }, { quoted: m });

    await new Promise(resolve => setTimeout(resolve, 800));

    await sock.sendMessage(m.from, {
      audio: { url: 'https://files.catbox.moe/9wx5b0.mp3' },
      mimetype: 'audio/mpeg',
      ptt: true,
      contextInfo: newsletterContext
    }, { quoted: m });
  }
};

export default menu;
