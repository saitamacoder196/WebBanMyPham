const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');


const app = express();
const port = 3000;


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, '../')));


const db = new sqlite3.Database('./shopping_cart.db', (err) => {
    if (err) {
        console.error('Unable to connect to database:', err.message);
    } else {
        console.log('Connected to SQLite database');


        db.run(`CREATE TABLE IF NOT EXISTS cart_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            product_name TEXT NOT NULL,
            product_price REAL NOT NULL,
            product_image TEXT,
            quantity INTEGER DEFAULT 1,
            session_id TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);


        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            original_price REAL,
            image TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            is_new BOOLEAN DEFAULT 1,
            discount_percent INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});




app.get('/api/cart/:sessionId', (req, res) => {
    const { sessionId } = req.params;

    db.all(`SELECT * FROM cart_items WHERE session_id = ?`, [sessionId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ items: rows });
    });
});


app.post('/api/cart', (req, res) => {
    const { product_id, product_name, product_price, product_image, quantity, session_id } = req.body;


    db.get(`SELECT * FROM cart_items WHERE product_id = ? AND session_id = ?`, [product_id, session_id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (row) {

            const newQuantity = row.quantity + (quantity || 1);

            db.run(`UPDATE cart_items SET quantity = ? WHERE id = ?`, [newQuantity, row.id], function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                res.json({ success: true, id: row.id, action: 'updated' });
            });
        } else {

            db.run(
                `INSERT INTO cart_items (product_id, product_name, product_price, product_image, quantity, session_id) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [product_id, product_name, product_price, product_image, quantity || 1, session_id],
                function (err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    res.json({ success: true, id: this.lastID, action: 'added' });
                }
            );
        }
    });
});


app.put('/api/cart/:id', (req, res) => {
    const { id } = req.params;
    const { quantity, session_id } = req.body;

    db.run(
        `UPDATE cart_items SET quantity = ? WHERE id = ? AND session_id = ?`,
        [quantity, id, session_id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Product not found or access denied' });
            }

            res.json({ success: true });
        }
    );
});


app.delete('/api/cart/:id', (req, res) => {
    const { id } = req.params;
    const { session_id } = req.body;

    db.run(
        `DELETE FROM cart_items WHERE id = ? AND session_id = ?`,
        [id, session_id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Product not found or access denied' });
            }

            res.json({ success: true });
        }
    );
});


app.delete('/api/cart/clear/:sessionId', (req, res) => {
    const { sessionId } = req.params;

    db.run(`DELETE FROM cart_items WHERE session_id = ?`, [sessionId], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json({ success: true });
    });
});


app.get('/api/products', (req, res) => {
    const { category, limit } = req.query;

    let query = 'SELECT * FROM products';
    let params = [];

    if (category) {
        query += ' WHERE category = ?';
        params.push(category);
        console.log(`Searching for products with category: ${category}`);
    }

    if (limit) {
        query += ' LIMIT ?';
        params.push(parseInt(limit));
    }

    console.log(`Executing query: ${query} with params: ${params}`);

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log(`Found ${rows.length} products`);
        res.json({ products: rows });
    });
});


app.get('/api/products/:id', (req, res) => {
    const { id } = req.params;

    db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ product: row });
    });
});


app.post('/api/products', (req, res) => {
    const { name, price, original_price, image, category, description, is_new, discount_percent } = req.body;

    db.run(
        `INSERT INTO products (name, price, original_price, image, category, description, is_new, discount_percent) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, price, original_price || null, image, category, description || null, is_new || 1, discount_percent || null],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({ id: this.lastID, success: true });
        }
    );
});


app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const { name, price, original_price, image, category, description, is_new, discount_percent } = req.body;

    db.run(
        `UPDATE products SET 
            name = ?, 
            price = ?, 
            original_price = ?, 
            image = ?, 
            category = ?, 
            description = ?, 
            is_new = ?, 
            discount_percent = ? 
         WHERE id = ?`,
        [name, price, original_price || null, image, category, description || null, is_new || 1, discount_percent || null, id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }

            res.json({ success: true });
        }
    );
});


app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM products WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ success: true });
    });
});


app.get('/product-details.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../product-details.html'));
});

app.get('/shopping-cart.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../shopping-cart.html'));
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});