import axios from 'axios';
import config from '../config.cjs';

const weather = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : '';

  if (cmd !== "weather") return;

  const args = m.body.trim().split(" ").slice(1);
  const city = args.join(" ");

  if (!city) {
    return await Matrix.sendMessage(m.from, {
      text: `❗ Usage: *${prefix}weather [city]*`,
    }, { quoted: m });
  }

  const apiKey = config.OPENWEATHER_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  try {
    const res = await axios.get(url);
    const data = res.data;

    const desc = data.weather[0].description;
    const temp = data.main.temp;
    const feels = data.main.feels_like;
    const humidity = data.main.humidity;
    const wind = data.wind.speed;

    const condition = data.weather[0].main;
    const emoji = getWeatherEmoji(condition);

    const text = `*🌦️ WEATHER REPORT: ${data.name}*\n\n` +
                 `*Condition:* ${desc}\n` +
                 `*Temperature:* ${temp}°C (Feels like ${feels}°C)\n` +
                 `*Humidity:* ${humidity}%\n` +
                 `*Wind:* ${wind} m/s\n\n` +
                 `_${emoji} Powered by OpenWeather_`;

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
    console.error("Weather API Error:", err?.response?.data || err.message);
    await Matrix.sendMessage(m.from, {
      text: `❌ Could not get weather for *${city}*. Please check the city name.`,
    }, { quoted: m });
  }
};

// Optional: Emoji helper
const getWeatherEmoji = (condition) => {
  switch (condition.toLowerCase()) {
    case 'clear': return '☀️';
    case 'clouds': return '☁️';
    case 'rain': return '🌧️';
    case 'thunderstorm': return '⛈️';
    case 'snow': return '❄️';
    case 'mist':
    case 'fog': return '🌫️';
    default: return '🌤️';
  }
};

export default weather;
