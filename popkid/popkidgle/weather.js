import axios from 'axios';
import config from '../config.cjs';

const weather = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : '';

  if (cmd === "weather") {
    const args = m.body.trim().split(" ").slice(1);
    const city = args.join(" ");

    if (!city) {
      return await Matrix.sendMessage(m.from, {
        text: `❗ Usage: *${prefix}weather [city]*`,
      }, { quoted: m });
    }

    const reactionEmojis = ['🌤️', '☁️', '🌧️', '⛈️', '❄️', '🌪️', '🌫️', '🔥', '🌈', '☀️'];
    const textEmojis = ['🌡️', '🌬️', '💧', '🌂', '🌀', '📍', '📡', '🌎', '🧭', '📊'];

    const reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
    let textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];

    // Ensure emojis are different
    while (textEmoji === reactionEmoji) {
      textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];
    }

    await m.React(textEmoji);

    try {
      const apiKey = config.OPENWEATHER_KEY;
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

      const res = await axios.get(url);
      const data = res.data;

      const desc = data.weather[0].description;
      const temp = data.main.temp;
      const feels = data.main.feels_like;
      const humidity = data.main.humidity;
      const wind = data.wind.speed;

      const text = `*🌦️ WEATHER REPORT: ${data.name} ${reactionEmoji}*\n\n` +
                   `*Condition:* ${desc}\n` +
                   `*Temperature:* ${temp}°C (Feels like ${feels}°C)\n` +
                   `*Humidity:* ${humidity}%\n` +
                   `*Wind:* ${wind} m/s\n\n` +
                   `_${textEmoji} Powered by OpenWeather_`;

      await Matrix.sendMessage(m.from, {
        text,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363290715861418@newsletter',
            newsletterName: "Popkid",
            serverMessageId: 143
          }
        }
      }, { quoted: m });

    } catch (err) {
      console.error("Weather Error:", err?.response?.data || err.message);
      await Matrix.sendMessage(m.from, {
        text: `❌ Could not fetch weather for *${city}*. Please check the name or try again.`,
      }, { quoted: m });
    }
  }
};

export default weather;
