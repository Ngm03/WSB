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

    const sql = "ALTER TABLE bookings ADD COLUMN floor VARCHAR(10) DEFAULT '3'";

    connection.query(sql, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Column already exists');
            } else {
                console.error('Error altering table:', err);
            }
        } else {
            console.log('Table altered successfully');
        }
        connection.end();
    });
});
