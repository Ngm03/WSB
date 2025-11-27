const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dorm_app'
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting:', err);
        return;
    }
    console.log('Connected to MySQL');

    // Helper to add column if not exists
    function addColumn(table, column, definition, callback) {
        const checkSql = `SHOW COLUMNS FROM ${table} LIKE '${column}'`;
        connection.query(checkSql, (err, rows) => {
            if (err) return callback(err);

            if (rows.length === 0) {
                const alterSql = `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`;
                connection.query(alterSql, (err) => {
                    if (err) return callback(err);
                    console.log(`✓ Added column ${column} to ${table}`);
                    callback(null);
                });
            } else {
                console.log(`- Column ${column} already exists in ${table}`);
                callback(null);
            }
        });
    }

    // 1. Add columns to gatherings table
    console.log('Adding columns to gatherings table...');
    addColumn('gatherings', 'image_url', 'TEXT', (err) => {
        if (err) console.error('Error adding image_url:', err);

        addColumn('gatherings', 'user_photo', 'TEXT', (err) => {
            if (err) console.error('Error adding user_photo:', err);

            addColumn('gatherings', 'user_id', 'VARCHAR(255)', (err) => {
                if (err) console.error('Error adding user_id:', err);

                addColumn('gatherings', 'first_name', 'TEXT', (err) => {
                    if (err) console.error('Error adding first_name:', err);

                    addColumn('gatherings', 'likes_count', 'INT DEFAULT 0', (err) => {
                        if (err) console.error('Error adding likes_count:', err);

                        addColumn('gatherings', 'comments_count', 'INT DEFAULT 0', (err) => {
                            if (err) console.error('Error adding comments_count:', err);

                            // 2. Create gathering_likes table
                            const createLikes = `
                                CREATE TABLE IF NOT EXISTS gathering_likes (
                                    id INT AUTO_INCREMENT PRIMARY KEY,
                                    gathering_id INT,
                                    user_id VARCHAR(255),
                                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                    UNIQUE KEY unique_like (gathering_id, user_id),
                                    FOREIGN KEY (gathering_id) REFERENCES gatherings(id) ON DELETE CASCADE
                                )
                            `;

                            connection.query(createLikes, (err) => {
                                if (err) console.error('Error creating likes table:', err);
                                else console.log('✓ Created gathering_likes table');

                                // 3. Create gathering_comments table
                                const createComments = `
                                    CREATE TABLE IF NOT EXISTS gathering_comments (
                                        id INT AUTO_INCREMENT PRIMARY KEY,
                                        gathering_id INT,
                                        user_id VARCHAR(255),
                                        username TEXT,
                                        first_name TEXT,
                                        photo_url TEXT,
                                        comment TEXT,
                                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                        FOREIGN KEY (gathering_id) REFERENCES gatherings(id) ON DELETE CASCADE
                                    )
                                `;

                                connection.query(createComments, (err) => {
                                    if (err) console.error('Error creating comments table:', err);
                                    else console.log('✓ Created gathering_comments table');

                                    console.log('\n✅ All migrations completed!');
                                    connection.end();
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
