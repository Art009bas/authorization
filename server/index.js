const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const TelegramLogin = require('telegram-login-node');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function validateTelegramAuth(req, res, next) {
  const { hash, ...authData } = req.body;
  const checker = new TelegramLogin(process.env.TELEGRAM_BOT_TOKEN);
  const isValid = checker.checkAuth({ hash, ...authData });
  if (!isValid) return res.status(401).send('Invalid Telegram login');
  next();
}

app.post('/api/report', validateTelegramAuth, async (req, res) => {
  const { amount, date, method, comment, id: tg_id } = req.body;
  await pool.query(
    'INSERT INTO reports (amount, date, method, comment, tg_id) VALUES ($1, $2, $3, $4, $5)',
    [amount, date, method, comment, tg_id]
  );
  res.send({ status: 'ok' });
});

app.get('/api/reports', async (req, res) => {
  const { tg_id } = req.query;
  const result = await pool.query('SELECT * FROM reports WHERE tg_id = $1', [tg_id]);
  res.send(result.rows);
});

app.listen(process.env.PORT || 3001, () => {
  console.log('Server started');
});
