// product-details.js
document.addEventListener('DOMContentLoaded', function() {
    // Lấy ID sản phẩm từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        loadProductDetails(productId);
    } else {
        // Hiển thị thông báo lỗi nếu không có ID sản phẩm
        document.querySelector('.product-title').textContent = 'Không tìm thấy sản phẩm';
    }
});

function loadProductDetails(productId) {
    fetch(`/api/products/${productId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.product) {
                renderProductDetails(data.product);
            } else {
                throw new Error('Không tìm thấy sản phẩm');
            }
        })
        .catch(error => {
            console.error('Error loading product details:', error);
            document.querySelector('.product-title').textContent = 'Không thể tải thông tin sản phẩm';
        });
}

function renderProductDetails(product) {
    // Cập nhật tiêu đề sản phẩm
    document.querySelector('.product-title').textContent = product.name;
    
    // Cập nhật hình ảnh
    const productImages = document.querySelectorAll('.preview-pic img, .preview-thumbnail img');
    productImages.forEach(img => {
        img.src = product.image;
    });
    
    // Cập nhật giá
    const originalPriceElement = document.querySelector('.text-muted s span');
    if (originalPriceElement && product.original_price) {
        originalPriceElement.textContent = formatPrice(product.original_price);
    }
    
    const currentPriceElement = document.querySelector('.price span');
    if (currentPriceElement) {
        currentPriceElement.textContent = formatPrice(product.price) + ' ₫';
    }
    
    // Cập nhật mô tả
    const descriptionElement = document.querySelector('.card .container-fluid .row .col');
    if (descriptionElement && product.description) {
        descriptionElement.innerHTML = product.description;
    }
    
    // Cập nhật data attributes cho nút "Add to cart"
    const addToCartBtn = document.querySelector('.add-to-cart');
    if (addToCartBtn) {
        addToCartBtn.setAttribute('data-id', product.id);
        addToCartBtn.setAttribute('data-name', product.name);
        addToCartBtn.setAttribute('data-price', product.price);
        addToCartBtn.setAttribute('data-image', product.image);
    }
}

function formatPrice(price) {
    return parseFloat(price).toLocaleString('vi-VN');
}