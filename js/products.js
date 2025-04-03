// products.js
document.addEventListener('DOMContentLoaded', function() {
    // Tải sản phẩm cho tab active khi trang được tải
    loadProducts();
    
    // Thêm sự kiện cho các tab sản phẩm
    const productTabs = document.querySelectorAll('[data-bs-toggle="pill"]');
    productTabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function (event) {
            const targetId = event.target.getAttribute('href');
            const category = getCategoryFromTabId(targetId);
            loadProducts(category);
        });
    });
});

// Hàm chuyển đổi tab ID thành danh mục
function getCategoryFromTabId(tabId) {
    // Giả sử tab-1 là "travel-backpack", tab-2 là "fashion-backpack", tab-3 là "special-offers"
    const tabCategories = {
        '#tab-1': 'travel-backpack',
        '#tab-2': 'fashion-backpack',
        '#tab-3': 'special-offers'
    };
    
    return tabCategories[tabId] || null;
}

// Hàm tải sản phẩm từ API
function loadProducts(category = 'travel-backpack') {
    // Thay đổi URL để trỏ đến đúng cổng server đang chạy
    const baseUrl = 'http://localhost:3000'; // Thay đổi thành đúng URL server của bạn
    const apiUrl = category ? `${baseUrl}/api/products?category=${category}` : `${baseUrl}/api/products`;
    
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Xác định tab nào đang active
            const activeTabId = category ? getTabIdFromCategory(category) : '#tab-1';
            const tabContent = document.querySelector(activeTabId);
            
            if (tabContent) {
                renderProducts(tabContent, data.products);
            }
        })
        .catch(error => {
            console.error('Error loading products:', error);
            alert('Không thể tải sản phẩm. Vui lòng thử lại sau.');
        });
}

// Hàm chuyển đổi danh mục thành tab ID
function getTabIdFromCategory(category) {
    const categoryTabs = {
        'travel-backpack': '#tab-1',
        'fashion-backpack': '#tab-2',
        'special-offers': '#tab-3'
    };
    
    return categoryTabs[category] || '#tab-1';
}

// Hàm hiển thị sản phẩm
function renderProducts(container, products) {
    // Tìm phần tử row để chứa sản phẩm
    const productRow = container.querySelector('.row');
    
    if (!productRow) {
        console.error('Product row not found in container');
        return;
    }
    
    // Xóa nội dung cũ trừ nút "See More Products"
    const seeMoreButton = productRow.querySelector('.text-center.wow.fadeInUp');
    productRow.innerHTML = '';
    
    if (products.length === 0) {
        productRow.innerHTML = '<div class="col-12 text-center">Không có sản phẩm nào.</div>';
        return;
    }
    
    // Tạo HTML cho từng sản phẩm
    products.forEach((product, index) => {
        const productHTML = createProductHTML(product, index);
        productRow.innerHTML += productHTML;
    });
    
    // Thêm lại nút "See More Products" nếu có
    if (seeMoreButton) {
        productRow.appendChild(seeMoreButton);
    }
    
    // Thiết lập lại sự kiện cho các nút "Add to cart"
    setupAddToCartButtons();
}

// Hàm tạo HTML cho sản phẩm
function createProductHTML(product, index) {
    const delay = 0.1 + (index % 4) * 0.2; // Delay cho animation
    const discountHTML = product.discount_percent ? 
        `<div class="bg-secondary rounded text-white position-absolute start-0 top-0 m-4 py-1 px-3">-${product.discount_percent}%</div>` :
        `<div class="bg-secondary rounded text-white position-absolute start-0 top-0 m-4 py-1 px-3">New</div>`;
    
    const originalPriceHTML = product.original_price ? 
        `<span class="text-body text-decoration-line-through">${formatPrice(product.original_price)} ₫</span>` : '';
    
    return `
    <div class="col-xl-3 col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="${delay}s">
        <div class="product-item">
            <div class="position-relative bg-light overflow-hidden">
                <img class="img-fluid w-100" src="${product.image}" alt="${product.name}" />
                ${discountHTML}
            </div>
            <div class="text-center p-4">
                <a class="d-block h5 mb-2" href="product-details.html?id=${product.id}">${product.name}</a>
                <span class="text-red me-1">${formatPrice(product.price)} ₫</span>
                ${originalPriceHTML}
            </div>
            <div class="d-flex border-top">
                <small class="w-50 text-center border-end py-2">
                    <a class="text-body" href="product-details.html?id=${product.id}">
                        <i class="fa fa-eye text-red me-2"></i>View detail
                    </a>
                </small>
                <small class="w-50 text-center py-2">
                    <a class="text-body add-to-cart" href="#" 
                       data-id="${product.id}" 
                       data-name="${product.name}" 
                       data-price="${product.price}" 
                       data-image="${product.image}">
                        <i class="fa fa-shopping-bag text-primary me-2"></i>Add to cart
                    </a>
                </small>
            </div>
        </div>
    </div>
    `;
}

// Hàm định dạng giá tiền
function formatPrice(price) {
    return parseFloat(price).toLocaleString('vi-VN');
}