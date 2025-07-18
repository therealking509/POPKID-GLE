import axios from 'axios';
import config from '../../config.cjs';

const githubStalk = async (m, gss) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();
    const args = text.split(' ');

    const validCommands = ['githubstalk', 'ghstalk'];

    if (!validCommands.includes(cmd)) return;
    if (!args[0]) return m.reply('*👤 Please provide a GitHub username.*\n\n_Example:_ `.githubstalk torvalds`');

    const username = args[0];
    const userUrl = `https://api.github.com/users/${username}`;
    const reposUrl = `https://api.github.com/users/${username}/repos?per_page=5&sort=stargazers_count&direction=desc`;

    try {
      const { data: user } = await axios.get(userUrl);

      let caption = `┏━━━⬣ *GITHUB STALKER*\n`;
      caption += `┃👤 *Name:* ${user.name || 'N/A'}\n`;
      caption += `┃🔰 *Username:* @${user.login}\n`;
      caption += `┃📝 *Bio:* ${user.bio || 'N/A'}\n`;
      caption += `┃🆔 *ID:* ${user.id}\n`;
      caption += `┃🌐 *GitHub URL:* ${user.html_url}\n`;
      caption += `┃🏢 *Company:* ${user.company || 'N/A'}\n`;
      caption += `┃📍 *Location:* ${user.location || 'N/A'}\n`;
      caption += `┃📬 *Email:* ${user.email || 'N/A'}\n`;
      caption += `┃📦 *Public Repos:* ${user.public_repos}\n`;
      caption += `┃👀 *Followers:* ${user.followers}\n`;
      caption += `┃👣 *Following:* ${user.following}\n`;
      caption += `┃📅 *Created:* ${new Date(user.created_at).toDateString()}\n`;
      caption += `┃♻️ *Updated:* ${new Date(user.updated_at).toDateString()}\n`;
      caption += `┗━━━━━━━━━━━━⬣`;

      const { data: repos } = await axios.get(reposUrl);
      if (repos.length) {
        caption += `\n\n📚 *Top Starred Repos:*\n`;
        for (const repo of repos) {
          caption += `\n➤ *${repo.name}*\n`;
          caption += `   🔗 ${repo.html_url}\n`;
          caption += `   📝 ${repo.description || 'No description'}\n`;
          caption += `   ⭐ ${repo.stargazers_count}   🍴 ${repo.forks}\n`;
        }
      } else {
        caption += `\n\n⚠️ No public repositories found.`;
      }

      await gss.sendMessage(m.from, {
        image: { url: user.avatar_url },
        caption,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363420342566562@newsletter",
            newsletterName: "PᴏᴘᴋɪᴅXᴛᴇᴄʜ",
            serverMessageId: 143
          }
        }
      }, { quoted: m });

    } catch (err) {
      console.error('❌ GitHub Fetch Error:', err);
      return m.reply(`❌ *GitHub user not found or network error occurred.*`);
    }
  } catch (error) {
    console.error('❌ Command Error:', error);
    m.reply('❌ An unexpected error occurred.');
  }
};

export default githubStalk;
