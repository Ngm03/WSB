const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dorm_app',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log('Checking users table for language_code values...\n');

pool.query('SELECT telegram_id, username, first_name, language_code FROM users ORDER BY updated_at DESC LIMIT 10', (err, results) => {
    if (err) {
        console.error('Error:', err.message);
        pool.end();
        return;
    }

    console.log('Recent users with language codes:');
    console.log('=====================================');

    if (results.length === 0) {
        console.log('No users found in database');
    } else {
        results.forEach((user, index) => {
            console.log(`${index + 1}. ${user.first_name || user.username}`);
            console.log(`   ID: ${user.telegram_id}`);
            console.log(`   Language: ${user.language_code || 'NOT SET'}`);
            console.log('---');
        });
    }

    pool.end();
});
