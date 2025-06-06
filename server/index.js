const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const pool = require('./db');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 👉 ВРЕМЕННЫЙ код для создания таблиц
pool.query(`
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    username TEXT,
    photo_url TEXT
);

CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    text TEXT,
    completed BOOLEAN DEFAULT false
);
`, (err) => {
    if (err) {
        console.error('❌ Ошибка при создании таблиц:', err);
    } else {
        console.log('✅ Таблицы успешно созданы или уже существуют');
    }
});

// 👉 Основные маршруты
app.use(routes);

// 👉 Запуск сервера
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
