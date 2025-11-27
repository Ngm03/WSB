const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dorm_app'
});

console.log('Adding first_name and photo_url columns to bookings table...');

// Check if columns exist first
pool.query(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'dorm_app' 
    AND TABLE_NAME = 'bookings' 
    AND COLUMN_NAME IN ('first_name', 'photo_url')
`, (err, rows) => {
    if (err) {
        console.error('Error checking columns:', err.message);
        pool.end();
        return;
    }

    const existingColumns = rows.map(r => r.COLUMN_NAME);
    const needFirstName = !existingColumns.includes('first_name');
    const needPhotoUrl = !existingColumns.includes('photo_url');

    if (!needFirstName && !needPhotoUrl) {
        console.log('✅ Columns already exist!');
        pool.end();
        return;
    }

    let alterQuery = 'ALTER TABLE bookings ';
    const alterParts = [];

    if (needFirstName) {
        alterParts.push('ADD COLUMN first_name TEXT AFTER username');
    }
    if (needPhotoUrl) {
        alterParts.push('ADD COLUMN photo_url TEXT AFTER ' + (needFirstName ? 'first_name' : 'username'));
    }

    alterQuery += alterParts.join(', ');

    pool.query(alterQuery, (err, result) => {
        if (err) {
            console.error('Error:', err.message);
        } else {
            console.log('✅ Columns added successfully!');
        }
        pool.end();
    });
});
