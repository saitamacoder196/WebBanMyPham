
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./shopping_cart.db');


const categoryMappings = [
    {
        pattern: /handbag|tui|tui xach|women/i,
        category: 'women-handbag'
    },
    {
        pattern: /backpack|balo|ba lo/i,
        category: 'fashion-backpack'
    },
    {
        pattern: /dulich|du lich|travel/i,
        category: 'travel-backpack'
    },

];


db.all('SELECT id, name, category FROM products', [], (err, rows) => {
    if (err) {
        console.error('Error fetching products:', err.message);
        return;
    }

    console.log(`Found ${rows.length} products to update categories`);

    rows.forEach(product => {

        let newCategory = 'other';

        for (const mapping of categoryMappings) {
            if (mapping.pattern.test(product.name) || mapping.pattern.test(product.category)) {
                newCategory = mapping.category;
                break;
            }
        }


        if (product.category !== newCategory) {
            db.run('UPDATE products SET category = ? WHERE id = ?', [newCategory, product.id], function (err) {
                if (err) {
                    console.error(`Error updating category for product ${product.id}:`, err.message);
                } else {
                    console.log(`Updated product ${product.id} category from "${product.category}" to "${newCategory}"`);
                }
            });
        }
    });

    console.log('Category update process initiated. Check logs for results.');
});


setTimeout(() => {
    db.all('SELECT category, COUNT(*) as count FROM products GROUP BY category', [], (err, rows) => {
        if (err) {
            console.error('Error counting categories:', err.message);
            return;
        }

        console.log('\nCategory distribution:');
        rows.forEach(row => {
            console.log(`${row.category}: ${row.count} products`);
        });

        db.close();
    });
}, 1000);