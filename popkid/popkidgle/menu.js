import config from '../../config.cjs';

const menu = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "menu") {
    await m.React('⚡');

    const uptime = () => {
      let seconds = Math.floor(process.uptime());
      let h = Math.floor(seconds / 3600);
      let m = Math.floor((seconds % 3600) / 60);
      let s = seconds % 60;
      return `${h}h ${m}m ${s}s`;
    };

    let profilePictureUrl = 'https://files.catbox.moe/kiy0hl.jpg';
    try {
      const pp = await sock.profilePictureUrl(m.sender, 'image');
      if (pp) profilePictureUrl = pp;
    } catch {}

    const menuText = `
╭───────────────⭓
│ ʙᴏᴛ : *ᴘᴏᴘᴋɪᴅ-xᴅ-v2*
│ ʀᴜɴᴛɪᴍᴇ : ${uptime()}
│ ᴍᴏᴅᴇ : public
│ ᴘʀᴇғɪx : ${prefix}
│ ᴏᴡɴᴇʀ : ${config.OWNER_NAME}
│ ᴅᴇᴠ : *ᴘᴏᴘᴋɪᴅ ʙᴏʏ*
│ ᴠᴇʀ : *𝟸.𝟶.𝟶*
╰───────────────⭓
────────────────────
𝙒𝙀𝙇𝘾𝙊𝙈𝙀 𝙏𝙊 𝙋𝙊𝙋𝙆𝙄𝘿-𝙓𝘿-𝙑2
────────────────────

⭓『 𝗠𝗔𝗜𝗡 𝗠𝗘𝗡𝗨 』
⬡ menu  
⬡ bugmenu  
⬡ speed  
⬡ alive  
⬡ sudo  
⬡ addpremium  
⬡ dev  
⬡ allvar  
⬡ ping  
⬡ owner  

⭓『 𝗢𝗪𝗡𝗘𝗥 𝗢𝗣𝗧𝗜𝗢𝗡𝗦 』
⬡ join  
⬡ autoread  
⬡ pair  
⬡ leave  
⬡ autostatusview  
⬡ autotyping  
⬡ autoblock  
⬡ autorecording  
⬡ autosticker  
⬡ antisticker  
⬡ restart  
⬡ block  
⬡ unblock  
⬡ anticall  
⬡ antidelete  
⬡ upload  
⬡ vv  
⬡ setstatusmsg  
⬡ allcmds  
⬡ calculater  
⬡ alwaysonline  
⬡ delete  
⬡ vv2  
⬡ setprefix  
⬡ setownername  
⬡ profile  
⬡ repo  

⭓『 𝗔𝗜 𝗠𝗢𝗗𝗨𝗟𝗘𝗦 』
⬡ ai  
⬡ bug  
⬡ bot  
⬡ report  
⬡ gemini  
⬡ chatbot  
⬡ gpt  
⬡ lydia  
⬡ popkid-ai  

⭓『 𝗖𝗢𝗡𝗩𝗘𝗥𝗧𝗘𝗥𝗦 』
⬡ attp  
⬡ gimage  
⬡ mp3  
⬡ ss  
⬡ fancy  
⬡ url  
⬡ url2  
⬡ shorten  
⬡ sticker  
⬡ take  

⭓『 𝗦𝗘𝗔𝗥𝗖𝗛 𝗙𝗘𝗔𝗧𝗨𝗥𝗘𝗦 』
⬡ google  
⬡ mediafire  
⬡ quranvideo  
⬡ quraimage  
⬡ facebook  
⬡ instagram  
⬡ tiktok  
⬡ lyrics  
⬡ ytsearch  
⬡ app  
⬡ bing  
⬡ ipstalk  
⬡ imdb  
⬡ pinterest  
⬡ githubstalk  
⬡ image  
⬡ ringtone  
⬡ playstore  
⬡ shazam  

⭓『 𝗙𝗨𝗡 𝗭𝗢𝗡𝗘 』
⬡ getpp  
⬡ avatar  
⬡ wcg  
⬡ joke  
⬡ ttt  
⬡ yesorno  
⬡ connect4  
⬡ rank  
⬡ quizz  
⬡ movie  
⬡ flirt  
⬡ givetext  
⬡ roast  
⬡ anime  
⬡ profile  
⬡ ebinary  
⬡ fetch  
⬡ qc  
⬡ couple  
⬡ poll  
⬡ emojimix  
⬡ score  
⬡ toqr  
⬡ tempmail  

⭓『 𝗚𝗥𝗢𝗨𝗣 𝗙𝗘𝗔𝗧𝗨𝗥𝗘𝗦 』
⬡ kickall  
⬡ remove  
⬡ tagall  
⬡ hidetag  
⬡ forward  
⬡ getall  
⬡ group close  
⬡ group open  
⬡ add  
⬡ vcf  
⬡ left  
⬡ promoteall  
⬡ demoteall  
⬡ setdescription  
⬡ linkgc  
⬡ antilink2  
⬡ antilink  
⬡ antisticker  
⬡ antispam  
⬡ create  
⬡ setname  
⬡ promote  
⬡ demote  
⬡ groupinfo  
⬡ balance  

⭓『 𝗛𝗘𝗡𝗧𝗔𝗜 』
⬡ hneko  
⬡ trap  
⬡ hwaifu  
⬡ hentai  

⭓『 𝗔𝗨𝗗𝗜𝗢 𝗘𝗙𝗙𝗘𝗖𝗧𝗦 』
⬡ earrape  
⬡ deep  
⬡ blown  
⬡ bass  
⬡ nightcore  
⬡ fat  
⬡ fast  
⬡ robot  
⬡ tupai  
⬡ smooth  
⬡ slow  
⬡ reverse  

⭓『 𝗥𝗘𝗔𝗖𝗧𝗜𝗢𝗡𝗦 』
⬡ bonk  
⬡ bully  
⬡ yeet  
⬡ slap  
⬡ nom  
⬡ poke  
⬡ awoo  
⬡ wave  
⬡ smile  
⬡ dance  
⬡ smug  
⬡ blush  
⬡ cringe  
⬡ sad  
⬡ happy  
⬡ shinobu  
⬡ cuddle  
⬡ glomp  
⬡ handhold  
⬡ highfive  
⬡ kick  
⬡ kill  
⬡ kiss  
⬡ cry  
⬡ bite  
⬡ lick  
⬡ pat  
⬡ hug  

────────────────────⭓  
⚡ 𝙋𝙊𝙋𝙆𝙄𝘿 𝙏𝙀𝘾𝙃 ⚡  
────────────────────⭓
    `.trim();

    await sock.sendMessage(m.from, {
      image: { url: profilePictureUrl },
      caption: menuText,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: 'Popkid-Xmd',
          newsletterJid: '120363290715861418@newsletter'
        },
        externalAdReply: {
          title: `${config.BOT_NAME} | POPKID MAIN`,
          body: `Bot by ${config.OWNER_NAME} • POPKID BOY TECH ⚡`,
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
