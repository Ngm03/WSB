// Gatherings API endpoints
module.exports = function (app, pool) {

    // Get all gatherings
    app.get('/api/gatherings', (req, res) => {
        const userId = req.headers['x-user-id'];
        const sql = `
        SELECT g.*, 
               EXISTS(SELECT 1 FROM gathering_likes WHERE gathering_id = g.id AND user_id = ?) as user_liked
        FROM gatherings g
        ORDER BY g.created_at DESC
    `;
        pool.query(sql, [userId], (err, rows) => {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }
            res.json({ "data": rows });
        });
    });

    // Create gathering
    app.post('/api/gatherings', (req, res) => {
        const { title, time, description, created_by, user_id, first_name, user_photo, image_url } = req.body;
        console.log('[POST /api/gatherings] Received:', { title, time, user_id, first_name, has_image: !!image_url });

        const sql = 'INSERT INTO gatherings (title, time, description, created_by, user_id, first_name, user_photo, image_url) VALUES (?,?,?,?,?,?,?,?)';
        const params = [title, time, description, created_by, user_id, first_name, user_photo, image_url];
        pool.query(sql, params, function (err, result) {
            if (err) {
                console.error('[POST /api/gatherings] Error:', err.message);
                res.status(400).json({ "error": err.message });
                return;
            }
            console.log('[POST /api/gatherings] Success, ID:', result.insertId);
            res.json({
                "message": "success",
                "data": req.body,
                "id": result.insertId
            });
        });
    });

    // Update gathering (only owner)
    app.put('/api/gatherings/:id', (req, res) => {
        const gatheringId = req.params.id;
        const userId = req.headers['x-user-id'];
        const { title, time, description, image_url } = req.body;

        // Check ownership
        pool.query('SELECT user_id FROM gatherings WHERE id = ?', [gatheringId], (err, rows) => {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }
            if (rows.length === 0) {
                res.status(404).json({ "error": "Gathering not found" });
                return;
            }
            if (rows[0].user_id != userId) {
                res.status(403).json({ "error": "Not authorized" });
                return;
            }

            // Update gathering
            const sql = 'UPDATE gatherings SET title = ?, time = ?, description = ?, image_url = ? WHERE id = ?';
            pool.query(sql, [title, time, description, image_url, gatheringId], (err) => {
                if (err) {
                    res.status(400).json({ "error": err.message });
                    return;
                }
                res.json({ "message": "updated" });
            });
        });
    });

    // Delete gathering (only owner)
    app.delete('/api/gatherings/:id', (req, res) => {
        const gatheringId = req.params.id;
        const userId = req.headers['x-user-id'];

        // Check ownership
        pool.query('SELECT user_id FROM gatherings WHERE id = ?', [gatheringId], (err, rows) => {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }
            if (rows.length === 0) {
                res.status(404).json({ "error": "Gathering not found" });
                return;
            }
            if (rows[0].user_id != userId) {
                res.status(403).json({ "error": "Not authorized" });
                return;
            }

            // Delete gathering
            pool.query('DELETE FROM gatherings WHERE id = ?', [gatheringId], (err) => {
                if (err) {
                    res.status(400).json({ "error": err.message });
                    return;
                }
                res.json({ "message": "deleted" });
            });
        });
    });

    // Like/Unlike gathering
    app.post('/api/gatherings/:id/like', (req, res) => {
        const gatheringId = req.params.id;
        const userId = req.headers['x-user-id'];

        if (!userId) {
            return res.status(401).json({ "error": "Unauthorized" });
        }

        // Check if already liked
        pool.query('SELECT * FROM gathering_likes WHERE gathering_id = ? AND user_id = ?', [gatheringId, userId], (err, rows) => {
            if (err) return res.status(500).json({ "error": err.message });

            if (rows.length > 0) {
                // Unlike
                pool.query('DELETE FROM gathering_likes WHERE gathering_id = ? AND user_id = ?', [gatheringId, userId], (err) => {
                    if (err) return res.status(500).json({ "error": err.message });
                    pool.query('UPDATE gatherings SET likes_count = likes_count - 1 WHERE id = ?', [gatheringId]);
                    res.json({ "message": "unliked" });
                });
            } else {
                // Like
                pool.query('INSERT INTO gathering_likes (gathering_id, user_id) VALUES (?,?)', [gatheringId, userId], (err) => {
                    if (err) return res.status(500).json({ "error": err.message });
                    pool.query('UPDATE gatherings SET likes_count = likes_count + 1 WHERE id = ?', [gatheringId]);
                    res.json({ "message": "liked" });
                });
            }
        });
    });

    // Get comments for gathering
    app.get('/api/gatherings/:id/comments', (req, res) => {
        const gatheringId = req.params.id;
        pool.query('SELECT * FROM gathering_comments WHERE gathering_id = ? ORDER BY created_at ASC', [gatheringId], (err, rows) => {
            if (err) return res.status(500).json({ "error": err.message });
            res.json({ "data": rows });
        });
    });

    // Add comment to gathering
    app.post('/api/gatherings/:id/comments', (req, res) => {
        const gatheringId = req.params.id;
        const { user_id, username, first_name, photo_url, comment } = req.body;

        if (!comment) {
            return res.status(400).json({ "error": "Comment is required" });
        }

        const sql = 'INSERT INTO gathering_comments (gathering_id, user_id, username, first_name, photo_url, comment) VALUES (?,?,?,?,?,?)';
        pool.query(sql, [gatheringId, user_id, username, first_name, photo_url, comment], (err, result) => {
            if (err) return res.status(500).json({ "error": err.message });

            // Update comments count
            pool.query('UPDATE gatherings SET comments_count = comments_count + 1 WHERE id = ?', [gatheringId]);

            res.json({ "message": "success", "id": result.insertId });
        });
    });

};
