// server.js
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const crypto = require('crypto');
const app = express();

// Подключение к PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://protokol_db_user:cHHaJl1IUJFjFrpuPWko41lsjjkEaukW@dpg-d0nki98dl3ps73acg24g-a/protokol_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

app.use(express.json());

// Эндпоинт для проверки данных Telegram
app.post('/api/telegram-auth', async (req, res) => {
  const authData = req.body;
  
  if (!verifyTelegramData(authData)) {
    return res.status(401).json({ error: 'Неверные данные авторизации' });
  }
  
  try {
    const user = await findOrCreateUser(authData);
    res.json({ user });
  } catch (error) {
    console.error('Ошибка базы данных:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Проверка данных Telegram
function verifyTelegramData(authData) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const dataToCheck = Object.keys(authData)
    .filter(key => key !== 'hash')
    .sort()
    .map(key => `${key}=${authData[key]}`)
    .join('\n');
  
  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataToCheck).digest('hex');
  
  return calculatedHash === authData.hash;
}

// Работа с пользователями в БД
async function findOrCreateUser(authData) {
  const { id, first_name, last_name, username, photo_url } = authData;
  
  // Поиск существующего пользователя
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE telegram_id = $1', 
    [id]
  );
  
  if (rows.length > 0) return rows[0];
  
  // Создание нового пользователя
  const newUser = await pool.query(
    `INSERT INTO users (
      telegram_id, first_name, last_name, username, photo_url, created_at
    ) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
    [id, first_name, last_name, username, photo_url]
  );
  
  return newUser.rows[0];
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
