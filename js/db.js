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

            console.log('Initializing IndexedDB...');
            const request = indexedDB.open(this.dbName, this.dbVersion);

            // Tạo/nâng cấp database
            request.onupgradeneeded = (event) => {
                console.log('Database upgrade needed');
                const db = event.target.result;

                // Tạo object store cart_items nếu chưa tồn tại
                if (!db.objectStoreNames.contains('cart_items')) {
                    console.log('Creating cart_items object store');
                    const store = db.createObjectStore('cart_items', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('product_id', 'product_id', { unique: false });
                    store.createIndex('session_id', 'session_id', { unique: false });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('IndexedDB initialized successfully');
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
            console.log('Created new session ID:', sessionId);
        } else {
            console.log('Using existing session ID:', sessionId);
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
                
                // Use getAll directly instead of using index
                const request = store.getAll();

                request.onsuccess = (event) => {
                    const items = event.target.result || [];
                    console.log('Retrieved cart items:', items.length);
                    
                    // Filter by session ID in JavaScript
                    const sessionItems = items.filter(item => item.session_id === sessionId);
                    console.log('Items for current session:', sessionItems.length);
                    
                    resolve(sessionItems);
                };

                request.onerror = (event) => {
                    console.error('Error getting cart items:', event.target.error);
                    reject(event.target.error);
                };
            }).catch(error => {
                console.error('Failed to initialize DB:', error);
                reject(error);
            });
        });
    },

    // Thêm sản phẩm vào giỏ hàng
    addToCart: function(product) {
        return new Promise((resolve, reject) => {
            if (!product || !product.product_id) {
                console.error('Invalid product:', product);
                reject(new Error('Invalid product data'));
                return;
            }
            
            this.init().then(db => {
                const sessionId = this.ensureSessionId();
                
                // First check if product already exists in cart
                this.getCartItems().then(items => {
                    const existingItem = items.find(item => 
                        item.product_id === product.product_id && 
                        item.session_id === sessionId
                    );
                    
                    const transaction = db.transaction(['cart_items'], 'readwrite');
                    const store = transaction.objectStore('cart_items');
                    
                    if (existingItem) {
                        // Update existing item
                        console.log('Updating existing item in cart:', existingItem.id);
                        existingItem.quantity += product.quantity || 1;
                        const updateRequest = store.put(existingItem);
                        
                        updateRequest.onsuccess = () => {
                            resolve({ success: true, id: existingItem.id, action: 'updated' });
                        };
                        
                        updateRequest.onerror = (event) => {
                            console.error('Error updating cart item:', event.target.error);
                            reject(event.target.error);
                        };
                    } else {
                        // Add new item
                        console.log('Adding new item to cart');
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
                            console.log('New item added to cart with ID:', event.target.result);
                            resolve({ success: true, id: event.target.result, action: 'added' });
                        };
                        
                        addRequest.onerror = (event) => {
                            console.error('Error adding item to cart:', event.target.error);
                            reject(event.target.error);
                        };
                    }
                }).catch(error => {
                    console.error('Error checking existing items:', error);
                    reject(error);
                });
            }).catch(error => {
                console.error('Failed to initialize DB for addToCart:', error);
                reject(error);
            });
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
                
                // Get all items first
                this.getCartItems().then(items => {
                    // Filter items for this session
                    const sessionItems = items.filter(item => item.session_id === sessionId);
                    
                    if (sessionItems.length === 0) {
                        resolve({ success: true, message: 'No items to clear' });
                        return;
                    }
                    
                    // Delete each item
                    let deletedCount = 0;
                    
                    sessionItems.forEach(item => {
                        const deleteRequest = store.delete(item.id);
                        
                        deleteRequest.onsuccess = () => {
                            deletedCount++;
                            if (deletedCount === sessionItems.length) {
                                resolve({ success: true, deletedCount });
                            }
                        };
                        
                        deleteRequest.onerror = (event) => {
                            console.error('Error deleting item:', event.target.error);
                            // Continue with other deletions
                        };
                    });
                }).catch(error => {
                    reject(error);
                });
            }).catch(reject);
        });
    }
};