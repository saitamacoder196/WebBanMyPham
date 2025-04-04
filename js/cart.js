

document.addEventListener('DOMContentLoaded', function () {

    if (typeof API !== 'undefined') {

        loadCart();

        setupAddToCartButtons();
    } else {
        console.error('API is not defined. Make sure api.js is loaded correctly.');
    }
});

let cartData = {
    items: [],
    totalItems: 0,
    totalPrice: 0
};

function loadCart() {
    API.getCartItems().then(items => {
        cartData.items = items;
        cartData.totalItems = items.reduce((total, item) => total + item.quantity, 0);
        cartData.totalPrice = items.reduce((total, item) => total + (item.product_price * item.quantity), 0);

        updateCartUI();
    }).catch(error => {
        console.error('Error loading cart:', error);
    });
}

function setupAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function (event) {
            event.preventDefault();

            const productId = parseInt(this.getAttribute('data-id'));
            const productName = this.getAttribute('data-name');
            const productPrice = parseFloat(this.getAttribute('data-price'));
            const productImage = this.getAttribute('data-image');

            addToCart(productId, productName, productPrice, productImage);
        });
    });
}

function addToCart(productId, productName, productPrice, productImage, quantity = 1) {

    const product = {
        product_id: productId,
        product_name: productName,
        product_price: productPrice,
        product_image: productImage,
        quantity: quantity
    };

    API.addToCart(product).then(result => {

        if (result.action === 'added') {
            showNotification('Sản phẩm đã được thêm vào giỏ hàng');
        } else {
            showNotification('Số lượng sản phẩm đã được cập nhật');
        }

        loadCart();
    }).catch(error => {
        console.error('Error adding to cart:', error);
        showNotification('Không thể thêm sản phẩm vào giỏ hàng', 'error');
    });
}

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

function removeFromCart(itemId) {
    API.removeFromCart(itemId).then(() => {
        loadCart();
        showNotification('Sản phẩm đã được xóa khỏi giỏ hàng');
    }).catch(error => {
        console.error('Error removing from cart:', error);
        showNotification('Không thể xóa sản phẩm', 'error');
    });
}

function updateCartUI() {
    console.log('Updating cart UI with items:', cartData.totalItems);

    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = cartData.totalItems;
    });

    const cartItemsContainer = document.querySelector('.cart-items-container');
    if (cartItemsContainer) {

        cartItemsContainer.innerHTML = '';

        if (cartData.items.length === 0) {

            cartItemsContainer.innerHTML = '<div class="empty-cart">Giỏ hàng của bạn đang trống</div>';
        } else {

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

            setupCartItemEvents();
        }

        const cartTotalElement = document.querySelector('.cart-total-price');
        if (cartTotalElement) {
            cartTotalElement.textContent = formatPrice(cartData.totalPrice) + ' đ';
        }
    }
}

function setupCartItemEvents() {

    document.querySelectorAll('.quantity-decrease').forEach(button => {
        button.addEventListener('click', function () {
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

    document.querySelectorAll('.quantity-increase').forEach(button => {
        button.addEventListener('click', function () {
            const itemId = parseInt(this.getAttribute('data-id'));
            const currentInput = document.querySelector(`.quantity-input[data-id="${itemId}"]`);
            const currentValue = parseInt(currentInput.value);
            updateQuantity(itemId, currentValue + 1);
        });
    });

    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function () {
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

    document.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', function () {
            const itemId = parseInt(this.getAttribute('data-id'));
            removeFromCart(itemId);
        });
    });
}

function formatPrice(price) {
    return parseFloat(price).toLocaleString('vi-VN');
}

function showNotification(message, type = 'success') {
    console.log('Notification:', message, type);

    let notification = document.querySelector('.notification');

    if (!notification) {

        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }

    notification.textContent = message;
    notification.className = 'notification ' + type;

    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}