
document.addEventListener('DOMContentLoaded', function () {

    const activeTab = document.querySelector('.nav-pills .active');
    if (activeTab) {
        const tabId = activeTab.getAttribute('href');
        const category = getCategoryFromTabId(tabId);
        loadProducts(category);
    } else {
        loadProducts();
    }


    const productTabs = document.querySelectorAll('[data-bs-toggle="pill"]');
    productTabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function (event) {
            const targetId = event.target.getAttribute('href');
            const category = getCategoryFromTabId(targetId);
            loadProducts(category);
        });
    });
});


function getCategoryFromTabId(tabId) {

    const tabCategories = {
        '#tab-1': ['handbag', 'women-handbag'],
        '#tab-2': ['backpack', 'fashion-backpack', 'travel-backpack'],
        '#tab-3': ['accessories', 'other']
    };

    return tabCategories[tabId] || [];
}


async function loadProducts(categories = null) {
    try {

        let tabId = '#tab-1'; // Default tab
        if (categories) {

            for (const [key, value] of Object.entries(getCategoryMapping())) {
                if (Array.isArray(categories) &&
                    categories.some(cat => value.includes(cat)) ||
                    value.includes(categories)) {
                    tabId = key;
                    break;
                }
            }
        }

        const container = document.querySelector(tabId);
        if (!container) {
            console.error('Container not found');
            return;
        }


        showLoadingSpinner(container);


        const products = await fetchProducts(categories);


        renderProducts(container, products);

    } catch (error) {
        console.error('Error loading products:', error);
        showError(error);
    }
}


function getCategoryMapping() {
    return {
        '#tab-1': ['handbag', 'women-handbag'],
        '#tab-2': ['backpack', 'fashion-backpack', 'travel-backpack'],
        '#tab-3': ['accessories', 'other']
    };
}


async function fetchProducts(categories) {
    if (!categories || (Array.isArray(categories) && categories.length === 0)) {

        try {
            const response = await fetch(`http://localhost:3000/api/products`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            return data.products || [];
        } catch (error) {
            console.error('Error fetching all products:', error);
            throw error;
        }
    }


    const baseUrl = 'http://localhost:3000/api/products';
    const allProducts = [];

    try {

        const categoryArray = Array.isArray(categories) ? categories : [categories];


        for (const category of categoryArray) {
            const response = await fetch(`${baseUrl}?category=${category}`);
            if (!response.ok) {
                console.warn(`Failed to fetch products for category "${category}"`);
                continue;
            }

            const data = await response.json();
            if (data.products && Array.isArray(data.products)) {
                allProducts.push(...data.products);
            }
        }

        return allProducts;
    } catch (error) {
        console.error('Error fetching products by categories:', error);
        throw error;
    }
}


function showLoadingSpinner(container) {
    const productRow = container.querySelector('.row');
    if (productRow) {
        productRow.innerHTML = `
            <div class="col-12 text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;
    }
}


function showError(error) {
    console.error('Error:', error);

}


function renderProducts(container, products) {

    const productRow = container.querySelector('.row');

    if (!productRow) {
        console.error('Product row not found in container');
        return;
    }


    const seeMoreButton = productRow.querySelector('.text-center.wow.fadeInUp');
    productRow.innerHTML = '';

    if (products.length === 0) {
        productRow.innerHTML = '<div class="col-12 text-center">Không có sản phẩm nào.</div>';
        return;
    }


    products.forEach((product, index) => {
        const productHTML = createProductHTML(product, index);
        productRow.innerHTML += productHTML;
    });


    if (seeMoreButton) {
        productRow.appendChild(seeMoreButton);
    }


    setupAddToCartButtons();


    new WOW().init();
}


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
                <span class="text-primary me-1">${formatPrice(product.price)} ₫</span>
                ${originalPriceHTML}
            </div>
            <div class="d-flex border-top">
                <small class="w-50 text-center border-end py-2">
                    <a class="text-body" href="product-details.html?id=${product.id}">
                        <i class="fa fa-eye text-primary me-2"></i>View detail
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


function formatPrice(price) {
    return parseFloat(price).toLocaleString('vi-VN');
}