// Database utility functions using IndexedDB
const DB = {
    dbName: 'shoppingCartDB',
    dbVersion: 1,
    db: null,

    // Khởi tạo cơ sở dữ liệu
    init: function() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                resolve(this.db);
                return;
            }

            const request = indexedDB.open(this.dbName, this.dbVersion);

            // Tạo/nâng cấp database
            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Tạo object store cart_items nếu chưa tồn tại
                if (!db.objectStoreNames.contains('cart_items')) {
                    const store = db.createObjectStore('cart_items', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('product_id', 'product_id', { unique: false });
                    store.createIndex('session_id', 'session_id', { unique: false });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onerror = (event) => {
                console.error('IndexedDB error:', event.target.error);
                reject(event.target.error);
            };
        });
    },

    // Tạo hoặc cập nhật session ID
    ensureSessionId: function() {
        let sessionId = localStorage.getItem('session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('session_id', sessionId);
        }
        return sessionId;
    },

    // Lấy tất cả sản phẩm trong giỏ hàng
    getCartItems: function() {
        return new Promise((resolve, reject) => {
            this.init().then(db => {
                const sessionId = this.ensureSessionId();
                const transaction = db.transaction(['cart_items'], 'readonly');
                const store = transaction.objectStore('cart_items');
                const index = store.index('session_id');
                const request = index.getAll(sessionId);

                request.onsuccess = (event) => {
                    const items = event.target.result;
                    resolve(items);
                };

                request.onerror = (event) => {
                    reject(event.target.error);
                };
            }).catch(reject);
        });
    },

    // Thêm sản phẩm vào giỏ hàng
    addToCart: function(product) {
        return new Promise((resolve, reject) => {
            this.init().then(db => {
                const sessionId = this.ensureSessionId();
                const transaction = db.transaction(['cart_items'], 'readwrite');
                const store = transaction.objectStore('cart_items');
                const index = store.index('product_id');
                const request = index.get(product.product_id);

                request.onsuccess = (event) => {
                    const existingItem = event.target.result;
                    if (existingItem && existingItem.session_id === sessionId) {
                        // Sản phẩm đã có trong giỏ, cập nhật số lượng
                        existingItem.quantity += product.quantity || 1;
                        store.put(existingItem);
                        resolve({ success: true, id: existingItem.id, action: 'updated' });
                    } else {
                        // Thêm sản phẩm mới
                        const newItem = {
                            product_id: product.product_id,
                            product_name: product.product_name,
                            product_price: product.product_price,
                            product_image: product.product_image || '',
                            quantity: product.quantity || 1,
                            session_id: sessionId,
                            created_at: new Date().toISOString()
                        };
                        const addRequest = store.add(newItem);
                        addRequest.onsuccess = (event) => {
                            resolve({ success: true, id: event.target.result, action: 'added' });
                        };
                        addRequest.onerror = (event) => {
                            reject(event.target.error);
                        };
                    }
                };

                request.onerror = (event) => {
                    reject(event.target.error);
                };
            }).catch(reject);
        });
    },

    // Cập nhật số lượng sản phẩm
    updateQuantity: function(id, quantity) {
        return new Promise((resolve, reject) => {
            this.init().then(db => {
                const sessionId = this.ensureSessionId();
                const transaction = db.transaction(['cart_items'], 'readwrite');
                const store = transaction.objectStore('cart_items');
                const request = store.get(id);

                request.onsuccess = (event) => {
                    const item = event.target.result;
                    if (item && item.session_id === sessionId) {
                        item.quantity = quantity;
                        const updateRequest = store.put(item);
                        updateRequest.onsuccess = () => {
                            resolve({ success: true });
                        };
                        updateRequest.onerror = (event) => {
                            reject(event.target.error);
                        };
                    } else {
                        reject(new Error('Item not found or access denied'));
                    }
                };

                request.onerror = (event) => {
                    reject(event.target.error);
                };
            }).catch(reject);
        });
    },

    // Xóa sản phẩm khỏi giỏ hàng
    removeFromCart: function(id) {
        return new Promise((resolve, reject) => {
            this.init().then(db => {
                const sessionId = this.ensureSessionId();
                const transaction = db.transaction(['cart_items'], 'readwrite');
                const store = transaction.objectStore('cart_items');
                const request = store.get(id);

                request.onsuccess = (event) => {
                    const item = event.target.result;
                    if (item && item.session_id === sessionId) {
                        const deleteRequest = store.delete(id);
                        deleteRequest.onsuccess = () => {
                            resolve({ success: true });
                        };
                        deleteRequest.onerror = (event) => {
                            reject(event.target.error);
                        };
                    } else {
                        reject(new Error('Item not found or access denied'));
                    }
                };

                request.onerror = (event) => {
                    reject(event.target.error);
                };
            }).catch(reject);
        });
    },

    // Xóa tất cả sản phẩm trong giỏ hàng
    clearCart: function() {
        return new Promise((resolve, reject) => {
            this.init().then(db => {
                const sessionId = this.ensureSessionId();
                const transaction = db.transaction(['cart_items'], 'readwrite');
                const store = transaction.objectStore('cart_items');
                const index = store.index('session_id');
                const request = index.openCursor(sessionId);

                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        store.delete(cursor.primaryKey);
                        cursor.continue();
                    } else {
                        resolve({ success: true });
                    }
                };

                request.onerror = (event) => {
                    reject(event.target.error);
                };
            }).catch(reject);
        });
    }
};