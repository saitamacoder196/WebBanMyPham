// Thay thế IndexedDB bằng API calls tới SQLite server
const API = {
    baseUrl: 'http://localhost:3000/api',
    
    // Tạo hoặc lấy session ID
    ensureSessionId: function() {
        let sessionId = localStorage.getItem('session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('session_id', sessionId);
        }
        return sessionId;
    },
    
    // Lấy tất cả sản phẩm trong giỏ hàng
    getCartItems: async function() {
        const sessionId = this.ensureSessionId();
        try {
            const response = await fetch(`${this.baseUrl}/cart/${sessionId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            return data.items;
        } catch (error) {
            console.error('Error fetching cart items:', error);
            throw error;
        }
    },
    
    // Thêm sản phẩm vào giỏ hàng
    addToCart: async function(product) {
        const sessionId = this.ensureSessionId();
        try {
            const response = await fetch(`${this.baseUrl}/cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_id: product.product_id,
                    product_name: product.product_name,
                    product_price: product.product_price,
                    product_image: product.product_image || '',
                    quantity: product.quantity || 1,
                    session_id: sessionId
                }),
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        }
    },
    
    // Cập nhật số lượng sản phẩm
    updateQuantity: async function(id, quantity) {
        const sessionId = this.ensureSessionId();
        try {
            const response = await fetch(`${this.baseUrl}/cart/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    quantity: quantity,
                    session_id: sessionId
                }),
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error updating quantity:', error);
            throw error;
        }
    },
    
    // Xóa sản phẩm khỏi giỏ hàng
    removeFromCart: async function(id) {
        const sessionId = this.ensureSessionId();
        try {
            const response = await fetch(`${this.baseUrl}/cart/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_id: sessionId
                }),
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error removing from cart:', error);
            throw error;
        }
    },
    
    // Xóa tất cả sản phẩm trong giỏ hàng
    clearCart: async function() {
        const sessionId = this.ensureSessionId();
        try {
            const response = await fetch(`${this.baseUrl}/cart/clear/${sessionId}`, {
                method: 'DELETE',
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error clearing cart:', error);
            throw error;
        }
    }
};