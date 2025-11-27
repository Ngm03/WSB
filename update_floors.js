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

    // Update all existing bookings to have floor = '3' if floor is NULL or empty
    const sql = "UPDATE bookings SET floor = '3' WHERE floor IS NULL OR floor = ''";

    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error updating bookings:', err);
        } else {
            console.log(`Updated ${result.affectedRows} bookings to floor 3`);
        }

        // Verify the update
        connection.query("SELECT id, date, slot_time, floor FROM bookings ORDER BY date, slot_time", (err, rows) => {
            if (err) {
                console.error('Error fetching bookings:', err);
            } else {
                console.log('\nCurrent bookings:');
                rows.forEach(row => {
                    console.log(`ID: ${row.id}, Date: ${row.date}, Time: ${row.slot_time}, Floor: ${row.floor}`);
                });
            }
            connection.end();
        });
    });
});
