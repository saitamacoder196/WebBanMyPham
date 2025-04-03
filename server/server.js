const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

// Khởi tạo Express app
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Khởi tạo database SQLite
const db = new sqlite3.Database('./shopping_cart.db', (err) => {
    if (err) {
        console.error('Không thể kết nối đến database:', err.message);
    } else {
        console.log('Đã kết nối đến database SQLite');
        
        // Tạo bảng cart_items nếu chưa tồn tại
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

// API Routes

// Lấy tất cả sản phẩm trong giỏ hàng
app.get('/api/cart/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    
    db.all(`SELECT * FROM cart_items WHERE session_id = ?`, [sessionId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ items: rows });
    });
});

// Thêm sản phẩm vào giỏ hàng
app.post('/api/cart', (req, res) => {
    const { product_id, product_name, product_price, product_image, quantity, session_id } = req.body;
    
    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    db.get(`SELECT * FROM cart_items WHERE product_id = ? AND session_id = ?`, [product_id, session_id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (row) {
            // Nếu sản phẩm đã tồn tại, tăng số lượng
            const newQuantity = row.quantity + (quantity || 1);
            
            db.run(`UPDATE cart_items SET quantity = ? WHERE id = ?`, [newQuantity, row.id], function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                
                res.json({ success: true, id: row.id, action: 'updated' });
            });
        } else {
            // Nếu sản phẩm chưa tồn tại, thêm mới
            db.run(
                `INSERT INTO cart_items (product_id, product_name, product_price, product_image, quantity, session_id) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [product_id, product_name, product_price, product_image, quantity || 1, session_id],
                function(err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    
                    res.json({ success: true, id: this.lastID, action: 'added' });
                }
            );
        }
    });
});

// Cập nhật số lượng sản phẩm
app.put('/api/cart/:id', (req, res) => {
    const { id } = req.params;
    const { quantity, session_id } = req.body;
    
    db.run(
        `UPDATE cart_items SET quantity = ? WHERE id = ? AND session_id = ?`,
        [quantity, id, session_id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Không tìm thấy sản phẩm hoặc không có quyền truy cập' });
            }
            
            res.json({ success: true });
        }
    );
});

// Xóa sản phẩm khỏi giỏ hàng
app.delete('/api/cart/:id', (req, res) => {
    const { id } = req.params;
    const { session_id } = req.body;
    
    db.run(
        `DELETE FROM cart_items WHERE id = ? AND session_id = ?`,
        [id, session_id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Không tìm thấy sản phẩm hoặc không có quyền truy cập' });
            }
            
            res.json({ success: true });
        }
    );
});

// Xóa tất cả sản phẩm trong giỏ hàng
app.delete('/api/cart/clear/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    
    db.run(`DELETE FROM cart_items WHERE session_id = ?`, [sessionId], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        res.json({ success: true });
    });
});

// Lấy tất cả sản phẩm hoặc lấy theo danh mục
app.get('/api/products', (req, res) => {
    const { category } = req.query;
    
    let query = 'SELECT * FROM products';
    let params = [];
    
    if (category) {
        query += ' WHERE category = ?';
        params.push(category);
    }
    
    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ products: rows });
    });
});

// Lấy chi tiết sản phẩm theo ID
app.get('/api/products/:id', (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
        }
        res.json({ product: row });
    });
});

// Thêm sản phẩm mới (chỉ admin)
app.post('/api/products', (req, res) => {
    const { name, price, original_price, image, category, description, is_new, discount_percent } = req.body;
    
    db.run(
        `INSERT INTO products (name, price, original_price, image, category, description, is_new, discount_percent) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, price, original_price || null, image, category, description || null, is_new || 1, discount_percent || null],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            res.json({ id: this.lastID, success: true });
        }
    );
});

// Khởi động server
app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});