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

    // Change image_url and user_photo to LONGTEXT to support large base64 images
    const alterImageUrl = `ALTER TABLE gatherings MODIFY COLUMN image_url LONGTEXT`;
    const alterUserPhoto = `ALTER TABLE gatherings MODIFY COLUMN user_photo LONGTEXT`;

    connection.query(alterImageUrl, (err) => {
        if (err) {
            console.error('Error modifying image_url:', err);
        } else {
            console.log('✓ Changed image_url to LONGTEXT');
        }

        connection.query(alterUserPhoto, (err) => {
            if (err) {
                console.error('Error modifying user_photo:', err);
            } else {
                console.log('✓ Changed user_photo to LONGTEXT');
            }

            console.log('\n✅ Migration completed!');
            connection.end();
        });
    });
});
