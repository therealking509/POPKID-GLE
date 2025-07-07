import config from '../../config.cjs';

const getProfilePic = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "getpp") {
    const target = text ? text.replace(/[^0-9]/g, '') + "@s.whatsapp.net" : m.sender;
    let profilePic;

    try {
      profilePic = await sock.profilePictureUrl(target, "image");
    } catch {
      profilePic = text
        ? "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60"
        : "https://telegra.ph/file/7cde96ce87ae7d9bd22a4.jpg";
    }

    const caption = `👤 *User JID:* ${target}
💠 *Powered by Popkid GLE Bot*`;

    await sock.sendMessage(m.from, {
      image: { url: profilePic },
      caption,
    }, { quoted: m });
  }
};

export default getProfilePic;
