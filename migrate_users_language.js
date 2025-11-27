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

console.log('Updating all existing users to have default language "ru"...\n');

pool.query(`
    UPDATE users 
    SET language_code = 'ru' 
    WHERE language_code = 'en' OR language_code IS NULL
`, (err, result) => {
    if (err) {
        console.error('Error:', err.message);
        pool.end();
        return;
    }

    console.log(`✅ Updated ${result.affectedRows} users to language "ru"`);

    // Show updated users
    pool.query('SELECT telegram_id, username, first_name, language_code FROM users ORDER BY updated_at DESC LIMIT 10', (err, results) => {
        if (err) {
            console.error('Error:', err.message);
            pool.end();
            return;
        }

        console.log('\nUpdated users:');
        console.log('=====================================');

        results.forEach((user, index) => {
            console.log(`${index + 1}. ${user.first_name || user.username}`);
            console.log(`   Language: ${user.language_code}`);
            console.log('---');
        });

        pool.end();
    });
});
