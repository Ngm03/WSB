const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

// --- НАСТРОЙКИ ---
const token = '8005167313:AAFu5AxIB2Itfhdgr6peM7rip0HGUieJmkc';
const ADMIN_IDS = ['299696306', '1300836384'];

const app = express();
const PORT = process.env.PORT || 3000;

// Render Public URL (автоматически определяется или задается вручную)
const RENDER_PUBLIC_URL = process.env.RENDER_EXTERNAL_URL || 'https://wsb-fx6d.onrender.com';
const WEBHOOK_PATH = '/bot' + token;
const fullWebhookUrl = RENDER_PUBLIC_URL + WEBHOOK_PATH;

// Инициализация бота: webhook для production, polling для development
const useWebhook = process.env.NODE_ENV === 'production' || process.env.USE_WEBHOOK === 'true';

let botOptions = {};

if (useWebhook) {
    // Production mode: используем webhook
    botOptions = {
        webHook: {
            port: PORT
        }
    };
    console.log('🌐 Bot will use WEBHOOK mode (production)');
} else {
    // Development mode: используем polling
    botOptions = { polling: true };
    console.log('🔄 Bot running in POLLING mode (development)');
}

const bot = new TelegramBot(token, botOptions);

// Handle polling errors (только для development)
if (!useWebhook) {
    bot.on('polling_error', (error) => {
        if (error.code === 'EFATAL') {
            console.error('[Telegram Bot] Connection error - retrying...', error.message);
        } else {
            console.error('[Telegram Bot] Polling error:', error.code || error.message);
        }
    });
}

// Setup PostgreSQL Connection Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:@localhost:5432/dorm_app',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to PostgreSQL:', err.message);
    } else {
        console.log('Connected to the PostgreSQL database.');
        release();
        initDb();
    }
});

// Handle pool errors
pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
});

function initDb() {
    const usersTable = `
        CREATE TABLE IF NOT EXISTS users (
            telegram_id VARCHAR(255) PRIMARY KEY,
            username TEXT,
            first_name TEXT,
            photo_url TEXT,
            language_code VARCHAR(10) DEFAULT 'en',
            updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
    `;

    const bookingsTable = `
        CREATE TABLE IF NOT EXISTS bookings (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255),
            username TEXT,
            first_name TEXT,
            photo_url TEXT,
            date VARCHAR(255),
            slot_time VARCHAR(255),
            end_time VARCHAR(255),
            floor VARCHAR(10) DEFAULT '3',
            comment TEXT,
            notified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
    `;

    const gatheringsTable = `
        CREATE TABLE IF NOT EXISTS gatherings (
            id SERIAL PRIMARY KEY,
            title TEXT,
            time VARCHAR(255),
            description TEXT,
            created_by VARCHAR(255),
            user_id VARCHAR(255),
            first_name TEXT,
            user_photo TEXT,
            image_url TEXT,
            likes_count INT DEFAULT 0,
            comments_count INT DEFAULT 0,
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
    `;

    const gatheringLikesTable = `
        CREATE TABLE IF NOT EXISTS gathering_likes (
            id SERIAL PRIMARY KEY,
            gathering_id INT,
            user_id VARCHAR(255),
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT unique_like_gathering UNIQUE (gathering_id, user_id),
            FOREIGN KEY (gathering_id) REFERENCES gatherings(id) ON DELETE CASCADE
        )
    `;

    const gatheringCommentsTable = `
        CREATE TABLE IF NOT EXISTS gathering_comments (
            id SERIAL PRIMARY KEY,
            gathering_id INT,
            user_id VARCHAR(255),
            username TEXT,
            first_name TEXT,
            photo_url TEXT,
            comment TEXT,
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (gathering_id) REFERENCES gatherings(id) ON DELETE CASCADE
        )
    `;

    const feedbackTable = `
        CREATE TABLE IF NOT EXISTS reviews (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255),
            username TEXT,
            first_name TEXT,
            photo_url TEXT,
            category VARCHAR(50),
            message TEXT,
            likes_count INT DEFAULT 0,
            comments_count INT DEFAULT 0,
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
    `;

    const commentsTable = `
        CREATE TABLE IF NOT EXISTS review_comments (
            id SERIAL PRIMARY KEY,
            review_id INT,
            user_id VARCHAR(255),
            username TEXT,
            first_name TEXT,
            photo_url TEXT,
            comment TEXT,
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
        )
    `;

    const likesTable = `
        CREATE TABLE IF NOT EXISTS review_likes (
            id SERIAL PRIMARY KEY,
            review_id INT,
            user_id VARCHAR(255),
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT unique_like_review UNIQUE (review_id, user_id),
            FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
        )
    `;

    pool.query(usersTable);
    pool.query(bookingsTable);
    pool.query(gatheringsTable);
    pool.query(gatheringLikesTable);
    pool.query(gatheringCommentsTable);
    pool.query(feedbackTable);
    pool.query(commentsTable);
    pool.query(likesTable);
}

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

// --- Helpers ---

function query(connection, sql, params) {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

function checkOverlap(connection, date, start, end, floor) {
    return query(connection, "SELECT * FROM bookings WHERE date = $1 AND floor = $2", [date, floor])
        .then(result => {
            return result.rows.some(row => {
                const existingStart = row.slot_time;
                const existingEnd = row.end_time || row.slot_time;
                return start < existingEnd && end > existingStart;
            });
        });
}

function insertBooking(connection, data) {
    const sql = 'INSERT INTO bookings (user_id, username, first_name, photo_url, date, slot_time, end_time, floor, comment) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)';
    const params = [data.user_id, data.username, data.first_name, data.photo_url, data.date, data.slot_time, data.end_time, data.floor, data.comment];
    return query(connection, sql, params);
}

function upsertUser(connection, user) {
    const sql = `
        INSERT INTO users (telegram_id, username, first_name, photo_url, language_code) 
        VALUES ($1, $2, $3, $4, $5) 
        ON CONFLICT (telegram_id) DO UPDATE SET 
            username = EXCLUDED.username, 
            first_name = EXCLUDED.first_name, 
            photo_url = EXCLUDED.photo_url,
            language_code = EXCLUDED.language_code,
            updated_at = CURRENT_TIMESTAMP
    `;
    return query(connection, sql, [user.user_id, user.username, user.first_name, user.photo_url, user.language_code || 'en']);
}

function getWarsawDate() {
    const warsawNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Warsaw' }));
    const year = warsawNow.getFullYear();
    const month = String(warsawNow.getMonth() + 1).padStart(2, '0');
    const day = String(warsawNow.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// --- API Endpoints ---

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
    res.send('Dorm App API is running! 🎮');
});

// Telegram Webhook endpoint (для production)
if (useWebhook) {
    app.post(WEBHOOK_PATH, (req, res) => {
        bot.processUpdate(req.body);
        res.sendStatus(200);
    });
    console.log(`📨 Webhook endpoint: ${WEBHOOK_PATH}`);
}

// Sync user data
app.post('/api/user/sync', async (req, res) => {
    const { user_id, username, first_name, photo_url, language_code } = req.body;

    if (!user_id) {
        return res.status(400).json({ "error": "Missing user_id" });
    }

    const client = await pool.connect();
    try {
        await upsertUser(client, { user_id, username, first_name, photo_url, language_code });
        await query(client,
            'UPDATE bookings SET username = $1, first_name = $2, photo_url = $3 WHERE user_id = $4',
            [username, first_name, photo_url, user_id]
        );
        res.json({ "message": "User synced successfully", "language_code": language_code || 'en' });
    } catch (error) {
        console.error("User sync error:", error);
        res.status(500).json({ "error": error.message || "Internal Server Error" });
    } finally {
        client.release();
    }
});

// Get user profile photo
app.get('/api/user/photo/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const photos = await bot.getUserProfilePhotos(userId, { limit: 1 });

        if (photos.total_count > 0) {
            const fileId = photos.photos[0][0].file_id;
            const file = await bot.getFile(fileId);
            const photoUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;

            await pool.query('UPDATE users SET photo_url = $1 WHERE telegram_id = $2', [photoUrl, userId]);
            await pool.query('UPDATE bookings SET photo_url = $1 WHERE user_id = $2', [photoUrl, userId]);

            res.json({ photo_url: photoUrl });
        } else {
            res.json({ photo_url: null });
        }
    } catch (error) {
        console.error('Error fetching profile photo:', error);
        res.json({ photo_url: null });
    }
});

// Get bookings
app.get('/api/bookings', async (req, res) => {
    const floor = req.query.floor || '3';
    const sql = `SELECT b.* FROM bookings b WHERE b.floor = $1 ORDER BY b.date, b.slot_time`;
    try {
        const result = await pool.query(sql, [floor]);
        res.json({ "data": result.rows });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Create booking
app.post('/api/bookings', async (req, res) => {
    const { user_id, username, first_name, photo_url, language_code, date, slot_time, end_time, comment, floor = '3' } = req.body;

    if (!date || !slot_time || !end_time) {
        return res.status(400).json({ "error": "Missing required fields" });
    }

    const today = getWarsawDate();
    if (date < today) {
        return res.status(400).json({ "error": "Нельзя бронировать в прошлом!" });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const lockId = 123456;
        const lockRes = await client.query('SELECT pg_try_advisory_lock($1) AS locked', [lockId]);
        if (!lockRes.rows[0].locked) {
            throw new Error("Server busy, try again");
        }

        try {
            await upsertUser(client, { user_id, username, first_name, photo_url, language_code });

            if (end_time < slot_time) {
                const nextDateObj = new Date(date);
                nextDateObj.setDate(nextDateObj.getDate() + 1);
                const nextDate = nextDateObj.toISOString().split('T')[0];

                const overlap1 = await checkOverlap(client, date, slot_time, "24:00", floor);
                const overlap2 = await checkOverlap(client, nextDate, "00:00", end_time, floor);

                if (overlap1 || overlap2) {
                    await client.query('ROLLBACK');
                    await client.query('SELECT pg_advisory_unlock($1)', [lockId]);
                    return res.status(409).json({ "error": "Пересечение с другой бронью!" });
                }

                await insertBooking(client, { user_id, username, first_name, photo_url, date, slot_time, end_time: "24:00", floor, comment: comment + " (Часть 1)" });
                await insertBooking(client, { user_id, username, first_name, photo_url, date: nextDate, slot_time: "00:00", end_time, floor, comment: comment + " (Часть 2)" });

                await client.query('COMMIT');
                await client.query('SELECT pg_advisory_unlock($1)', [lockId]);
                res.json({ "message": "success", "crossDay": true });

            } else {
                const hasOverlap = await checkOverlap(client, date, slot_time, end_time, floor);
                if (hasOverlap) {
                    await client.query('ROLLBACK');
                    await client.query('SELECT pg_advisory_unlock($1)', [lockId]);
                    return res.status(409).json({ "error": "Это время уже занято!" });
                }

                await insertBooking(client, { user_id, username, first_name, photo_url, date, slot_time, end_time, floor, comment });
                await client.query('COMMIT');
                await client.query('SELECT pg_advisory_unlock($1)', [lockId]);
                res.json({ "message": "success" });
            }
        } catch (error) {
            await client.query('ROLLBACK');
            await client.query('SELECT pg_advisory_unlock($1)', [lockId]);
            throw error;
        }

    } catch (error) {
        console.error("Transaction Error:", error);
        res.status(500).json({ "error": error.message || "Internal Server Error" });
    } finally {
        client.release();
    }
});

// Update booking
app.put('/api/bookings/:id', async (req, res) => {
    const bookingId = req.params.id;
    const userId = req.headers['x-user-id'];
    const { slot_time, end_time, comment } = req.body;

    if (!userId) return res.status(401).json({ "error": "Unauthorized" });
    if (!slot_time || !end_time) return res.status(400).json({ "error": "Missing fields" });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const result = await client.query('SELECT * FROM bookings WHERE id = $1 FOR UPDATE', [bookingId]);
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ "error": "Booking not found" });
        }

        const booking = result.rows[0];

        if (String(booking.user_id) !== String(userId) && !ADMIN_IDS.includes(String(userId))) {
            await client.query('ROLLBACK');
            return res.status(403).json({ "error": "Нет прав" });
        }

        if (slot_time < booking.slot_time || end_time > booking.end_time) {
            await client.query('ROLLBACK');
            return res.status(400).json({ "error": "Можно только уменьшить время брони!" });
        }

        if (booking.end_time === "24:00" && end_time < "24:00") {
            const dateObj = new Date(booking.date);
            dateObj.setDate(dateObj.getDate() + 1);
            const nextDate = dateObj.toISOString().split('T')[0];

            const part2Result = await client.query(
                'SELECT id FROM bookings WHERE user_id = $1 AND date = $2 AND slot_time = $3',
                [userId, nextDate, "00:00"]
            );

            if (part2Result.rows.length > 0) {
                await client.query('DELETE FROM bookings WHERE id = $1', [part2Result.rows[0].id]);
            }
        }

        await client.query('UPDATE bookings SET slot_time = $1, end_time = $2, comment = $3 WHERE id = $4',
            [slot_time, end_time, comment, bookingId]);

        await client.query('COMMIT');
        res.json({ "message": "Updated successfully" });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ "error": "Internal Server Error" });
    } finally {
        client.release();
    }
});

// Delete booking
app.delete('/api/bookings/:id', async (req, res) => {
    const bookingId = req.params.id;
    const userId = req.headers['x-user-id'];

    if (!userId) {
        return res.status(401).json({ "error": "Unauthorized" });
    }

    try {
        const result = await pool.query('SELECT user_id FROM bookings WHERE id = $1', [bookingId]);
        if (result.rows.length === 0) return res.status(404).json({ "error": "Booking not found" });

        const booking = result.rows[0];
        const isOwner = String(booking.user_id) === String(userId);
        const isAdmin = ADMIN_IDS.includes(String(userId));

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ "error": "У вас нет прав удалять эту бронь" });
        }

        await pool.query('DELETE FROM bookings WHERE id = $1', [bookingId]);
        res.json({ "message": "deleted" });
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

// Gatherings endpoints
app.get('/api/gatherings', async (req, res) => {
    const userId = req.headers['x-user-id'];
    const sql = `
        SELECT g.*, 
               EXISTS(SELECT 1 FROM gathering_likes WHERE gathering_id = g.id AND user_id = $1) as user_liked
        FROM gatherings g
        ORDER BY g.created_at DESC
    `;
    try {
        const result = await pool.query(sql, [userId]);
        res.json({ "data": result.rows });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

app.post('/api/gatherings', async (req, res) => {
    const { title, time, description, created_by, user_id, first_name, user_photo, image_url } = req.body;
    const sql = 'INSERT INTO gatherings (title, time, description, created_by, user_id, first_name, user_photo, image_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id';
    const params = [title, time, description, created_by, user_id, first_name, user_photo, image_url];
    try {
        const result = await pool.query(sql, params);
        res.json({ "message": "success", "data": req.body, "id": result.rows[0].id });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

app.put('/api/gatherings/:id', async (req, res) => {
    const gatheringId = req.params.id;
    const userId = req.headers['x-user-id'];
    const { title, time, description, image_url } = req.body;

    try {
        const result = await pool.query('SELECT user_id FROM gatherings WHERE id = $1', [gatheringId]);
        if (result.rows.length === 0) return res.status(404).json({ "error": "Not found" });
        if (result.rows[0].user_id != userId) return res.status(403).json({ "error": "Not authorized" });

        const sql = 'UPDATE gatherings SET title = $1, time = $2, description = $3, image_url = $4 WHERE id = $5';
        await pool.query(sql, [title, time, description, image_url, gatheringId]);
        res.json({ "message": "updated" });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

app.delete('/api/gatherings/:id', async (req, res) => {
    const gatheringId = req.params.id;
    const userId = req.headers['x-user-id'];

    try {
        const result = await pool.query('SELECT user_id FROM gatherings WHERE id = $1', [gatheringId]);
        if (result.rows.length === 0) return res.status(404).json({ "error": "Not found" });
        if (result.rows[0].user_id != userId) return res.status(403).json({ "error": "Not authorized" });

        await pool.query('DELETE FROM gatherings WHERE id = $1', [gatheringId]);
        res.json({ "message": "deleted" });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

app.post('/api/gatherings/:id/like', async (req, res) => {
    const gatheringId = req.params.id;
    const userId = req.headers['x-user-id'];

    if (!userId) return res.status(401).json({ "error": "Unauthorized" });

    try {
        const result = await pool.query('SELECT * FROM gathering_likes WHERE gathering_id = $1 AND user_id = $2', [gatheringId, userId]);

        if (result.rows.length > 0) {
            await pool.query('DELETE FROM gathering_likes WHERE gathering_id = $1 AND user_id = $2', [gatheringId, userId]);
            await pool.query('UPDATE gatherings SET likes_count = likes_count - 1 WHERE id = $1', [gatheringId]);
            res.json({ "message": "unliked" });
        } else {
            await pool.query('INSERT INTO gathering_likes (gathering_id, user_id) VALUES ($1,$2)', [gatheringId, userId]);
            await pool.query('UPDATE gatherings SET likes_count = likes_count + 1 WHERE id = $1', [gatheringId]);
            res.json({ "message": "liked" });
        }
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

app.get('/api/gatherings/:id/comments', async (req, res) => {
    const gatheringId = req.params.id;
    try {
        const result = await pool.query('SELECT * FROM gathering_comments WHERE gathering_id = $1 ORDER BY created_at ASC', [gatheringId]);
        res.json({ "data": result.rows });
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

app.post('/api/gatherings/:id/comments', async (req, res) => {
    const gatheringId = req.params.id;
    const { user_id, username, first_name, photo_url, comment } = req.body;

    if (!comment) return res.status(400).json({ "error": "Comment is required" });

    const sql = 'INSERT INTO gathering_comments (gathering_id, user_id, username, first_name, photo_url, comment) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id';
    try {
        const result = await pool.query(sql, [gatheringId, user_id, username, first_name, photo_url, comment]);
        await pool.query('UPDATE gatherings SET comments_count = comments_count + 1 WHERE id = $1', [gatheringId]);
        res.json({ "message": "success", "id": result.rows[0].id });
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

app.patch('/api/gathering-comments/:id', async (req, res) => {
    const commentId = req.params.id;
    const userId = req.headers['x-user-id'];
    const { comment } = req.body;

    if (!userId) return res.status(401).json({ "error": "Unauthorized" });

    try {
        const result = await pool.query('SELECT user_id FROM gathering_comments WHERE id = $1', [commentId]);
        if (result.rows.length === 0) return res.status(404).json({ "error": "Comment not found" });

        if (String(result.rows[0].user_id) !== String(userId)) {
            return res.status(403).json({ "error": "Forbidden" });
        }

        await pool.query('UPDATE gathering_comments SET comment = $1 WHERE id = $2', [comment, commentId]);
        res.json({ "message": "updated" });
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

app.delete('/api/gathering-comments/:id', async (req, res) => {
    const commentId = req.params.id;
    const userId = req.headers['x-user-id'];

    if (!userId) return res.status(401).json({ "error": "Unauthorized" });

    try {
        const result = await pool.query('SELECT user_id, gathering_id FROM gathering_comments WHERE id = $1', [commentId]);
        if (result.rows.length === 0) return res.status(404).json({ "error": "Comment not found" });

        if (String(result.rows[0].user_id) !== String(userId)) {
            return res.status(403).json({ "error": "Forbidden" });
        }

        const gatheringId = result.rows[0].gathering_id;

        await pool.query('DELETE FROM gathering_comments WHERE id = $1', [commentId]);
        await pool.query('UPDATE gatherings SET comments_count = comments_count - 1 WHERE id = $1', [gatheringId]);

        res.json({ "message": "deleted" });
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

// Notification system
setInterval(async () => {
    const warsawNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Warsaw' }));
    const currentDate = getWarsawDate();

    const futureTime = new Date(warsawNow.getTime() + 15 * 60000);
    const futureHour = String(futureTime.getHours()).padStart(2, '0');
    const futureMinute = String(futureTime.getMinutes()).padStart(2, '0');
    const targetTime = `${futureHour}:${futureMinute}`;

    try {
        const result = await pool.query(
            'SELECT * FROM bookings WHERE date = $1 AND slot_time = $2 AND notified = FALSE',
            [currentDate, targetTime]
        );

        for (const booking of result.rows) {
            try {
                await bot.sendMessage(
                    booking.user_id,
                    `🎮 Напоминание!\n\nТвоя бронь PS Zone начнется через 15 минут (${booking.slot_time}).\n\nУспей прийти! 🕹️`
                );
                await pool.query('UPDATE bookings SET notified = TRUE WHERE id = $1', [booking.id]);
            } catch (err) {
                console.error('Send message error:', err);
            }
        }
    } catch (err) {
        console.error('Notification check error:', err);
    }
}, 60000);

// Reviews endpoints
app.post('/api/reviews', async (req, res) => {
    const { user_id, username, first_name, photo_url, category, message } = req.body;

    if (!message || !category) {
        return res.status(400).json({ "error": "Missing required fields" });
    }

    try {
        const result = await pool.query('SELECT COUNT(*) as count FROM reviews WHERE user_id = $1', [user_id]);

        if (parseInt(result.rows[0].count) >= 3) {
            return res.status(400).json({ "error": "Вы уже оставили максимум отзывов (3)" });
        }

        const sql = 'INSERT INTO reviews (user_id, username, first_name, photo_url, category, message) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id';
        const insertResult = await pool.query(sql, [user_id, username, first_name, photo_url, category, message]);
        res.json({ "message": "success", "id": insertResult.rows[0].id });
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

app.get('/api/reviews', async (req, res) => {
    const userId = req.headers['x-user-id'];

    const sql = `
        SELECT r.*, 
               EXISTS(SELECT 1 FROM review_likes WHERE review_id = r.id AND user_id = $1) as user_liked
        FROM reviews r
        ORDER BY r.created_at DESC
    `;

    try {
        const result = await pool.query(sql, [userId]);
        res.json({ "data": result.rows });
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

app.post('/api/reviews/:id/like', async (req, res) => {
    const reviewId = req.params.id;
    const userId = req.headers['x-user-id'];

    if (!userId) {
        return res.status(401).json({ "error": "Unauthorized" });
    }

    try {
        const result = await pool.query('SELECT * FROM review_likes WHERE review_id = $1 AND user_id = $2', [reviewId, userId]);

        if (result.rows.length > 0) {
            await pool.query('DELETE FROM review_likes WHERE review_id = $1 AND user_id = $2', [reviewId, userId]);
            await pool.query('UPDATE reviews SET likes_count = likes_count - 1 WHERE id = $1', [reviewId]);
            res.json({ "message": "unliked" });
        } else {
            await pool.query('INSERT INTO review_likes (review_id, user_id) VALUES ($1,$2)', [reviewId, userId]);
            await pool.query('UPDATE reviews SET likes_count = likes_count + 1 WHERE id = $1', [reviewId]);
            res.json({ "message": "liked" });
        }
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

app.get('/api/reviews/:id/comments', async (req, res) => {
    const reviewId = req.params.id;

    try {
        const result = await pool.query('SELECT * FROM review_comments WHERE review_id = $1 ORDER BY created_at ASC', [reviewId]);
        res.json({ "data": result.rows });
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

app.post('/api/reviews/:id/comments', async (req, res) => {
    const reviewId = req.params.id;
    const { user_id, username, first_name, photo_url, comment } = req.body;

    if (!comment) {
        return res.status(400).json({ "error": "Comment is required" });
    }

    const sql = 'INSERT INTO review_comments (review_id, user_id, username, first_name, photo_url, comment) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id';
    try {
        const result = await pool.query(sql, [reviewId, user_id, username, first_name, photo_url, comment]);
        await pool.query('UPDATE reviews SET comments_count = comments_count + 1 WHERE id = $1', [reviewId]);
        res.json({ "message": "success", "id": result.rows[0].id });
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

app.patch('/api/review-comments/:id', async (req, res) => {
    const commentId = req.params.id;
    const userId = req.headers['x-user-id'];
    const { comment } = req.body;

    if (!userId) return res.status(401).json({ "error": "Unauthorized" });

    try {
        const result = await pool.query('SELECT user_id FROM review_comments WHERE id = $1', [commentId]);
        if (result.rows.length === 0) return res.status(404).json({ "error": "Comment not found" });

        if (String(result.rows[0].user_id) !== String(userId)) {
            return res.status(403).json({ "error": "Forbidden" });
        }

        await pool.query('UPDATE review_comments SET comment = $1 WHERE id = $2', [comment, commentId]);
        res.json({ "message": "updated" });
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

app.delete('/api/review-comments/:id', async (req, res) => {
    const commentId = req.params.id;
    const userId = req.headers['x-user-id'];

    if (!userId) return res.status(401).json({ "error": "Unauthorized" });

    try {
        const result = await pool.query('SELECT user_id, review_id FROM review_comments WHERE id = $1', [commentId]);
        if (result.rows.length === 0) return res.status(404).json({ "error": "Comment not found" });

        if (String(result.rows[0].user_id) !== String(userId)) {
            return res.status(403).json({ "error": "Forbidden" });
        }

        const reviewId = result.rows[0].review_id;

        await pool.query('DELETE FROM review_comments WHERE id = $1', [commentId]);
        await pool.query('UPDATE reviews SET comments_count = comments_count - 1 WHERE id = $1', [reviewId]);

        res.json({ "message": "deleted" });
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

app.put('/api/reviews/:id', async (req, res) => {
    const reviewId = req.params.id;
    const userId = req.headers['x-user-id'];
    const { category, message } = req.body;

    if (!userId) return res.status(401).json({ "error": "Unauthorized" });

    try {
        const result = await pool.query('SELECT user_id FROM reviews WHERE id = $1', [reviewId]);
        if (result.rows.length === 0) return res.status(404).json({ "error": "Review not found" });

        if (String(result.rows[0].user_id) !== String(userId)) {
            return res.status(403).json({ "error": "Forbidden" });
        }

        await pool.query('UPDATE reviews SET category = $1, message = $2 WHERE id = $3', [category, message, reviewId]);
        res.json({ "message": "updated" });
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

app.delete('/api/reviews/:id', async (req, res) => {
    const reviewId = req.params.id;
    const userId = req.headers['x-user-id'];

    if (!userId) return res.status(401).json({ "error": "Unauthorized" });

    try {
        const result = await pool.query('SELECT user_id FROM reviews WHERE id = $1', [reviewId]);
        if (result.rows.length === 0) return res.status(404).json({ "error": "Review not found" });

        if (String(result.rows[0].user_id) !== String(userId)) {
            return res.status(403).json({ "error": "Forbidden" });
        }

        await pool.query('DELETE FROM reviews WHERE id = $1', [reviewId]);
        res.json({ "message": "deleted" });
    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

// Telegram Bot Commands
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '👋 Привет! Это бот общежития.\n\nЗдесь можно:\n🎮 Забронировать PS зону\n📢 Создать сбор (например, поиграть в снежки)', {
        reply_markup: {
            inline_keyboard: [[
                {
                    text: '🚀 Открыть приложение',
                    web_app: { url: "https://wsb-fx6d.onrender.com" }
                }
            ]]
        }
    });
});

// Start server and setup webhook
app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);

    // Setup webhook for production
    if (useWebhook) {
        try {
            await bot.setWebhook(fullWebhookUrl);
            console.log(`✅ Webhook установлен: ${fullWebhookUrl}`);
        } catch (error) {
            console.error('❌ Ошибка установки webhook:', error.message);
        }
    }
});
