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

console.log('Adding language_code column to users table...');

// First check if column exists
pool.query(`
    SELECT COUNT(*) as count 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'dorm_app' 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'language_code'
`, (err, result) => {
    if (err) {
        console.error('Error checking column:', err.message);
        pool.end();
        return;
    }

    if (result[0].count > 0) {
        console.log('✅ Column language_code already exists');
        pool.end();
    } else {
        // Add column if it doesn't exist
        pool.query(`
            ALTER TABLE users 
            ADD COLUMN language_code VARCHAR(10) DEFAULT 'en'
        `, (err, result) => {
            if (err) {
                console.error('Error adding column:', err.message);
            } else {
                console.log('✅ Successfully added language_code column to users table');
            }
            pool.end();
        });
    }
});
