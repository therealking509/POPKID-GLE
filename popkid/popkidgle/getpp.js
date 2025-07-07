import config from '../../config.cjs';

const getProfilePic = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "getpp") {
    // Step 1: Define target — prioritize replied user, then text number, then sender
    let target;

    if (m.quoted && m.quoted.sender) {
      target = m.quoted.sender;
    } else if (text) {
      target = text.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
    } else {
      target = m.sender;
    }

    // Step 2: Try to fetch profile picture
    let profilePic;
    try {
      profilePic = await sock.profilePictureUrl(target, 'image');
    } catch {
      profilePic = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
    }

    // Step 3: Send result
    const caption = `👤 *User JID:* ${target}
💠 *Powered by Popkid GLE Bot*`;

    await sock.sendMessage(m.from, {
      image: { url: profilePic },
      caption,
    }, { quoted: m });
  }
};

export default getProfilePic;
