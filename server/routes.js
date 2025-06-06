const express = require('express');
const pool = require('./db');
const router = express.Router();

// сохранить пользователя
router.post('/api/auth', async (req, res) => {
    const { id, first_name, last_name, username, photo_url } = req.body;
    try {
        await pool.query(`
            INSERT INTO users (id, first_name, last_name, username, photo_url)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (id) DO UPDATE SET
                first_name = EXCLUDED.first_name,
                last_name = EXCLUDED.last_name,
                username = EXCLUDED.username,
                photo_url = EXCLUDED.photo_url
        `, [id, first_name, last_name, username, photo_url]);
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сохранения пользователя');
    }
});

// сохранить задачу
router.post('/api/task', async (req, res) => {
    const { userId, text } = req.body;
    try {
        await pool.query(`
            INSERT INTO tasks (user_id, text, completed)
            VALUES ($1, $2, false)
        `, [userId, text]);
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сохранения задачи');
    }
});

// получить задачи пользователя
router.get('/api/tasks/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await pool.query(`
            SELECT id, text, completed FROM tasks WHERE user_id = $1
        `, [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка загрузки задач');
    }
});

module.exports = router;
