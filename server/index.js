const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./db');
const checkTelegramAuth = require('./verifyTelegram');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/auth/telegram', async (req, res) => {
  const data = req.query;

  if (!checkTelegramAuth(data)) {
    return res.status(403).send('Неверная авторизация');
  }

  const { id, first_name, last_name, username, photo_url } = data;

  try {
    await pool.query(
      \`INSERT INTO users (id, first_name, last_name, username, photo_url)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING\`,
      [id, first_name, last_name, username, photo_url]
    );

    res.send(\`<h2>Добро пожаловать, \${first_name}!</h2><p>Вы успешно вошли через Telegram.</p>\`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`Сервер работает на порту \${PORT}\`));