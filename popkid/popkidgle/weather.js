import axios from 'axios';
import config from '../config.cjs';

const weather = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const body = m.body.startsWith(prefix) ? m.body.slice(prefix.length).trim() : '';
  const [cmd, ...args] = body.split(" ");

  if (cmd.toLowerCase() !== "weather") return;

  if (!args.length) {
    return await Matrix.sendMessage(m.from, {
      text: `❗ Usage: *${prefix}weather [city]*`,
    }, { quoted: m });
  }

  const city = args.join(" ");
  const apiKey = config.OPENWEATHER_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  try {
    const res = await axios.get(url);
    const data = res.data;

    const name = data.name;
    const desc = data.weather[0].description;
    const temp = data.main.temp;
    const feels = data.main.feels_like;
    const humidity = data.main.humidity;
    const wind = data.wind.speed;

    const emoji = getWeatherEmoji(data.weather[0].main);

    const text = `${emoji} *Weather in ${name}*\n\n` +
                 `*Condition:* ${desc}\n` +
                 `*Temperature:* ${temp}°C (Feels like ${feels}°C)\n` +
                 `*Humidity:* ${humidity}%\n` +
                 `*Wind:* ${wind} m/s`;

    await Matrix.sendMessage(m.from, { text }, { quoted: m });

  } catch (err) {
    await Matrix.sendMessage(m.from, {
      text: `❌ Could not find weather for *${city}*. Please check the city name.`,
    }, { quoted: m });
  }
};

// Optional: adds emojis for fun
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
