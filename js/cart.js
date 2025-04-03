// Khởi tạo các biến và sự kiện khi document đã sẵn sàng
// Khởi tạo các biến và sự kiện khi document đã sẵn sàng
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra xem API đã được định nghĩa chưa
    if (typeof API !== 'undefined') {
        // Load giỏ hàng khi trang web được tải
        loadCart();
        
        // Thêm sự kiện cho các nút "Add to cart"
        setupAddToCartButtons();
    } else {
        console.error('API is not defined. Make sure api.js is loaded correctly.');
    }
});
// Biến toàn cục để lưu trữ dữ liệu giỏ hàng
let cartData = {
    items: [],
    totalItems: 0,
    totalPrice: 0
};

// Hàm tải giỏ hàng từ IndexedDB
function loadCart() {
    API.getCartItems().then(items => {
        cartData.items = items;
        cartData.totalItems = items.reduce((total, item) => total + item.quantity, 0);
        cartData.totalPrice = items.reduce((total, item) => total + (item.product_price * item.quantity), 0);
        
        // Cập nhật UI
        updateCartUI();
    }).catch(error => {
        console.error('Error loading cart:', error);
    });
}

// Hàm thiết lập sự kiện cho các nút "Add to cart"
function setupAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            
            // Lấy thông tin sản phẩm từ data attributes
            const productId = parseInt(this.getAttribute('data-id'));
            const productName = this.getAttribute('data-name');
            const productPrice = parseFloat(this.getAttribute('data-price'));
            const productImage = this.getAttribute('data-image');
            
            // Thêm sản phẩm vào giỏ hàng
            addToCart(productId, productName, productPrice, productImage);
        });
    });
}


// Hàm thêm sản phẩm vào giỏ hàng
function addToCart(productId, productName, productPrice, productImage, quantity = 1) {
    // Tạo đối tượng sản phẩm
    const product = {
        product_id: productId,
        product_name: productName,
        product_price: productPrice,
        product_image: productImage,
        quantity: quantity
    };
    
    // Thêm vào database thông qua API
    API.addToCart(product).then(result => {
        // Thông báo thành công
        if (result.action === 'added') {
            showNotification('Sản phẩm đã được thêm vào giỏ hàng');
        } else {
            showNotification('Số lượng sản phẩm đã được cập nhật');
        }
        
        // Cập nhật lại giỏ hàng
        loadCart();
    }).catch(error => {
        console.error('Error adding to cart:', error);
        showNotification('Không thể thêm sản phẩm vào giỏ hàng', 'error');
    });
}


// Hàm cập nhật số lượng sản phẩm
function updateQuantity(itemId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(itemId);
        return;
    }
    
    API.updateQuantity(itemId, newQuantity).then(() => {
        loadCart();
    }).catch(error => {
        console.error('Error updating quantity:', error);
        showNotification('Không thể cập nhật số lượng', 'error');
    });
}


// Hàm xóa sản phẩm khỏi giỏ hàng
function removeFromCart(itemId) {
    API.removeFromCart(itemId).then(() => {
        loadCart();
        showNotification('Sản phẩm đã được xóa khỏi giỏ hàng');
    }).catch(error => {
        console.error('Error removing from cart:', error);
        showNotification('Không thể xóa sản phẩm', 'error');
    });
}


// Hàm cập nhật giao diện giỏ hàng
function updateCartUI() {
    console.log('Updating cart UI with items:', cartData.totalItems);
    
    // Cập nhật số lượng sản phẩm trên icon giỏ hàng
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = cartData.totalItems;
    });
    
    // Nếu đang ở trang giỏ hàng, cập nhật danh sách sản phẩm
    const cartItemsContainer = document.querySelector('.cart-items-container');
    if (cartItemsContainer) {
        // Xóa tất cả sản phẩm hiện tại
        cartItemsContainer.innerHTML = '';
        
        if (cartData.items.length === 0) {
            // Hiển thị thông báo giỏ hàng trống
            cartItemsContainer.innerHTML = '<div class="empty-cart">Giỏ hàng của bạn đang trống</div>';
        } else {
            // Tạo HTML cho từng sản phẩm
            cartData.items.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.innerHTML = `
                    <div class="cart-item-image">
                        <img src="${item.product_image || 'img/default-product.jpg'}" alt="${item.product_name}">
                    </div>
                    <div class="cart-item-details">
                        <h3>${item.product_name}</h3>
                        <p class="cart-item-price">${formatPrice(item.product_price)} đ</p>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn quantity-decrease" data-id="${item.id}">-</button>
                        <input type="number" value="${item.quantity}" min="1" class="quantity-input" data-id="${item.id}">
                        <button class="quantity-btn quantity-increase" data-id="${item.id}">+</button>
                    </div>
                    <div class="cart-item-total">
                        ${formatPrice(item.product_price * item.quantity)} đ
                    </div>
                    <div class="cart-item-remove">
                        <button class="remove-item-btn" data-id="${item.id}">×</button>
                    </div>
                `;
                
                cartItemsContainer.appendChild(itemElement);
            });
            
            // Thêm sự kiện cho các nút trong giỏ hàng
            setupCartItemEvents();
        }
        
        // Cập nhật tổng tiền
        const cartTotalElement = document.querySelector('.cart-total-price');
        if (cartTotalElement) {
            cartTotalElement.textContent = formatPrice(cartData.totalPrice) + ' đ';
        }
    }
}

// Hàm thiết lập sự kiện cho các phần tử trong giỏ hàng
function setupCartItemEvents() {
    // Sự kiện giảm số lượng
    document.querySelectorAll('.quantity-decrease').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = parseInt(this.getAttribute('data-id'));
            const currentInput = document.querySelector(`.quantity-input[data-id="${itemId}"]`);
            const currentValue = parseInt(currentInput.value);
            if (currentValue > 1) {
                updateQuantity(itemId, currentValue - 1);
            } else {
                removeFromCart(itemId);
            }
        });
    });
    
    // Sự kiện tăng số lượng
    document.querySelectorAll('.quantity-increase').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = parseInt(this.getAttribute('data-id'));
            const currentInput = document.querySelector(`.quantity-input[data-id="${itemId}"]`);
            const currentValue = parseInt(currentInput.value);
            updateQuantity(itemId, currentValue + 1);
        });
    });
    
    // Sự kiện thay đổi giá trị ô input số lượng
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            const itemId = parseInt(this.getAttribute('data-id'));
            const newValue = parseInt(this.value);
            if (newValue >= 1) {
                updateQuantity(itemId, newValue);
            } else {
                this.value = 1;
                updateQuantity(itemId, 1);
            }
        });
    });
    
    // Sự kiện xóa sản phẩm
    document.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = parseInt(this.getAttribute('data-id'));
            removeFromCart(itemId);
        });
    });
}

// Hàm định dạng giá tiền
function formatPrice(price) {
    return parseFloat(price).toLocaleString('vi-VN');
}

// Hàm hiển thị thông báo
function showNotification(message, type = 'success') {
    console.log('Notification:', message, type);
    
    // Kiểm tra xem đã có phần tử notification chưa
    let notification = document.querySelector('.notification');
    
    if (!notification) {
        // Tạo mới nếu chưa có
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Đặt nội dung và loại thông báo
    notification.textContent = message;
    notification.className = 'notification ' + type;
    
    // Hiển thị thông báo
    notification.classList.add('show');
    
    // Tự động ẩn sau 3 giây
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}