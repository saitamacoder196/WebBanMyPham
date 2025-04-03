// product-loader.js - Handles loading and displaying products from the database
// Define the category mapping for each tab globally so it can be accessed by all functions
const categoryMapping = {
    '#tab-1': ['handbag', 'women-handbag'],
    '#tab-2': ['backpack', 'fashion-backpack', 'travel-backpack'],
    '#tab-3': ['accessories', 'other']
};

document.addEventListener('DOMContentLoaded', function() {
    // Load initial products for the active tab
    const activeTab = document.querySelector('.nav-pills .active');
    if (activeTab) {
        const tabId = activeTab.getAttribute('href');
        loadProductsByTab(tabId);
    }

    // Add event listeners for tab changes
    const productTabs = document.querySelectorAll('[data-bs-toggle="pill"]');
    productTabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function (event) {
            const targetId = event.target.getAttribute('href');
            loadProductsByTab(targetId);
        });
    });

    // Load recommended/related products for the carousel
    // loadRelatedProducts();

    // Setup cart functionality
    setupAddToCartButtons();
});

/**
 * Loads products for a specific tab
 * @param {string} tabId - The tab ID to load products for
 */
function loadProductsByTab(tabId) {
    const containerSelector = getContainerSelectorForTab(tabId);
    const container = document.querySelector(containerSelector);
    
    if (!container) {
        console.error(`Container not found for tab: ${tabId}`);
        return;
    }

    // Show loading indicator
    container.innerHTML = `
        <div class="col-12 text-center">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;

    // Get the categories for this tab
    const categories = getCategoriesForTab(tabId);
    
    // Debug info
    console.log(`Loading products for tab ${tabId} with categories:`, categories);
    
    fetchProducts(categories)
        .then(products => {
            console.log(`Loaded ${products.length} products for tab ${tabId}`);
            displayProducts(container, products);
        })
        .catch(error => {
            console.error(`Error loading products for tab ${tabId}:`, error);
            container.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-danger" role="alert">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        Error loading products. Please try again later.
                    </div>
                    <button class="btn btn-primary mt-3" onclick="loadProductsByTab('${tabId}')">
                        Try Again
                    </button>
                </div>
            `;
        });
}

/**
 * Returns the selector for the product container based on tab ID
 * @param {string} tabId - The tab ID
 * @returns {string} The CSS selector for the container
 */
function getContainerSelectorForTab(tabId) {
    switch (tabId) {
        case '#tab-1':
            return '#tab-1 .row';
        case '#tab-2':
            return '#tab-2 .row';
        case '#tab-3':
            return '#tab-3 .row';
        default:
            return '#tab-1 .row';
    }
}

/**
 * Returns the product categories for a specific tab
 * @param {string} tabId - The tab ID
 * @returns {Array} Array of category strings
 */
function getCategoriesForTab(tabId) {
    return categoryMapping[tabId] || [];
}

/**
 * Fetches products from the API based on categories
 * @param {Array} categories - Categories to filter by
 * @returns {Promise} Promise with product data
 */
async function fetchProducts(categories) {
    if (!categories || categories.length === 0) {
        // If no categories specified, fetch all products
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
    
    // If we have categories to filter by
    const baseUrl = 'http://localhost:3000/api/products';
    const allProducts = [];
    
    try {
        // Fetch each category separately to prevent stream reading errors
        for (const category of categories) {
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

/**
 * Displays products in the specified container
 * @param {HTMLElement} container - The container to display products in
 * @param {Array} products - Array of product objects
 */
function displayProducts(container, products) {
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <p>No products found in this category.</p>
            </div>
        `;
        return;
    }

    let productsHTML = '';

    products.forEach((product, index) => {
        const delay = 0.1 + (index % 4) * 0.2;
        const discountBadge = product.discount_percent 
            ? `<div class="bg-secondary rounded text-white position-absolute start-0 top-0 m-4 py-1 px-3">-${product.discount_percent}%</div>`
            : `<div class="bg-secondary rounded text-white position-absolute start-0 top-0 m-4 py-1 px-3">New</div>`;

        const originalPrice = product.original_price 
            ? `<span class="text-body text-decoration-line-through">${formatPrice(product.original_price)} đ</span>`
            : '';

        productsHTML += `
            <div class="col-xl-3 col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="${delay}s">
                <div class="product-item">
                    <div class="position-relative bg-light overflow-hidden">
                        <img class="img-fluid w-100" src="${product.image}" alt="${product.name}">
                        ${discountBadge}
                    </div>
                    <div class="text-center p-4">
                        <a class="d-block h5 mb-2" href="product-details.html?id=${product.id}">${product.name}</a>
                        <span class="text-primary me-1">${formatPrice(product.price)} đ</span>
                        ${originalPrice}
                    </div>
                    <div class="d-flex border-top">
                        <small class="w-50 text-center border-end py-2">
                            <a class="text-body" href="product-details.html?id=${product.id}"><i class="fa fa-eye text-primary me-2"></i>View detail</a>
                        </small>
                        <small class="w-50 text-center py-2">
                           <a class="text-body add-to-cart" href="#" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.image}"><i class="fa fa-shopping-bag text-primary me-2"></i>Add to cart</a>
                        </small>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = productsHTML;

    // Initialize WOW animations
    new WOW().init();
    
    // Setup add to cart buttons
    setupAddToCartButtons();
}

/**
 * Loads related products for the carousel
 */
/**
 * Loads related products for the carousel with compact design
 */
/**
 * Loads related products for the carousel matching the existing design pattern
 */
function loadRelatedProducts() {
    const carousel = document.querySelector('.testimonial-carousel');
    if (!carousel) return;

    fetch('http://localhost:3000/api/products?limit=8')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            let carouselHTML = '';
            const products = data.products || [];

            products.forEach(product => {
                const originalPrice = product.original_price 
                    ? `<span class="text-body text-decoration-line-through">${formatPrice(product.original_price)} ₫</span>` 
                    : '';
            
                carouselHTML += `
                    <div class="position-relative bg-white p-5 mt-4">
                        <i class="fa fa-quote-left fa-3x text-primary position-absolute top-0 start-0 mt-n4 ms-5"></i>
                        <img class="" src="${product.image}" alt="${product.name}">
                        <div class="text-center p-4">
                            <a class="d-block h5 mb-2" href="product-details.html?id=${product.id}">${product.name}</a>
                            <span class="text-primary me-1">${formatPrice(product.price)} ₫</span>
                            ${originalPrice}
                        </div>
                        <div class="d-flex border-top">
                            <small class="w-50 text-center border-end py-2">
                                <a class="text-body" href="product-details.html?id=${product.id}"><i class="fa fa-eye text-primary me-2"></i>View detail</a>
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
                `;
            });        

            carousel.innerHTML = carouselHTML;

            // Initialize Owl Carousel
            $(carousel).owlCarousel({
                autoplay: true,
                smartSpeed: 1000,
                margin: 25,
                loop: true,
                center: true,
                dots: false,
                nav: true,
                navText: [
                    '<i class="bi bi-chevron-left"></i>',
                    '<i class="bi bi-chevron-right"></i>'
                ],
                responsive: {
                    0: {
                        items: 1
                    },
                    768: {
                        items: 2
                    },
                    992: {
                        items: 3
                    }
                }
            });
            
            // Setup add to cart buttons
            setupAddToCartButtons();
        })
        .catch(error => {
            console.error('Error loading related products:', error);
            carousel.innerHTML = 'Error loading related products.';
        });
}

/**
 * Sets up click event listeners for add to cart buttons
 */
function setupAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    addToCartButtons.forEach(button => {
        // Remove existing event listeners to prevent duplicates
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', function(event) {
            event.preventDefault();
            
            const productId = parseInt(this.getAttribute('data-id'));
            const productName = this.getAttribute('data-name');
            const productPrice = parseFloat(this.getAttribute('data-price'));
            const productImage = this.getAttribute('data-image');
            
            // Add the product to cart
            addToCart(productId, productName, productPrice, productImage);
        });
    });
}

/**
 * Adds a product to the cart
 * @param {number} productId - Product ID
 * @param {string} productName - Product name
 * @param {number} productPrice - Product price
 * @param {string} productImage - Product image URL
 * @param {number} quantity - Quantity to add (default: 1)
 */
function addToCart(productId, productName, productPrice, productImage, quantity = 1) {
    // Create a product object
    const product = {
        product_id: productId,
        product_name: productName,
        product_price: productPrice,
        product_image: productImage,
        quantity: quantity
    };
    
    // Add to database through API
    API.addToCart(product).then(result => {
        // Show success notification
        showNotification(`Product "${productName}" added to cart!`, 'success');
        
        // Refresh cart icon count
        loadCart();
    }).catch(error => {
        console.error('Error adding to cart:', error);
        showNotification('Failed to add product to cart', 'error');
    });
}

/**
 * Formats price with thousands separators
 * @param {number} price - The price to format
 * @returns {string} Formatted price string
 */
function formatPrice(price) {
    return parseFloat(price).toLocaleString('vi-VN');
}

/**
 * Shows a notification message
 * @param {string} message - The message to display
 * @param {string} type - The notification type ('success' or 'error')
 */
function showNotification(message, type = 'success') {
    // Check if notification element exists
    let notification = document.querySelector('.notification');
    
    if (!notification) {
        // Create notification element if it doesn't exist
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Set message and type
    notification.textContent = message;
    notification.className = `notification ${type}`;
    
    // Show notification
    notification.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}