// product-details.js - Handles loading and displaying product details
document.addEventListener('DOMContentLoaded', function() {
    // Get product ID from URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        loadProductDetails(productId);
        loadRelatedProducts(productId);
    } else {
        showError('Product ID not found');
    }
    
    // Add event listener for "Add to Cart" button
    document.getElementById('addToCartBtn').addEventListener('click', handleAddToCart);
});

/**
 * Loads product details from the API
 * @param {string|number} productId - The product ID to load details for
 */
function loadProductDetails(productId) {
    // Show loading spinner
    document.getElementById('productLoadingSpinner').classList.remove('d-none');
    document.getElementById('productDetailsContainer').classList.add('d-none');
    document.getElementById('productDescriptionContainer').classList.add('d-none');
    
    // Fetch product data from API
    fetch(`http://localhost:3000/api/products/${productId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.product) {
                displayProductDetails(data.product);
            } else {
                throw new Error('Product not found');
            }
        })
        .catch(error => {
            console.error('Error loading product details:', error);
            showError('Error loading product details. Please try again later.');
        });
}

/**
 * Displays product details on the page
 * @param {Object} product - The product object with details
 */
function displayProductDetails(product) {
    // Hide loading spinner
    document.getElementById('productLoadingSpinner').classList.add('d-none');
    document.getElementById('productDetailsContainer').classList.remove('d-none');
    document.getElementById('productDescriptionContainer').classList.remove('d-none');
    
    // Update product image
    const productImage = document.querySelector('#product-image img');
    productImage.src = product.image;
    productImage.alt = product.name;
    
    // Update product title
    document.querySelector('.product-title').textContent = product.name;
    
    // Update price information
    const originalPriceElement = document.querySelector('.original-price s span');
    const currentPriceElement = document.querySelector('.current-price span');
    
    if (product.original_price) {
        document.querySelector('.original-price').classList.remove('d-none');
        originalPriceElement.textContent = formatPrice(product.original_price) + ' đ';
    } else {
        document.querySelector('.original-price').classList.add('d-none');
    }
    
    currentPriceElement.textContent = formatPrice(product.price) + ' đ';
    
    // Update product description
    const descriptionElement = document.querySelector('.product-description');
    if (product.description) {
        descriptionElement.textContent = product.description;
    } else {
        descriptionElement.textContent = 'No description available for this product.';
    }
    
    // Set add to cart button data attributes
    const addToCartBtn = document.getElementById('addToCartBtn');
    addToCartBtn.setAttribute('data-id', product.id);
    addToCartBtn.setAttribute('data-name', product.name);
    addToCartBtn.setAttribute('data-price', product.price);
    addToCartBtn.setAttribute('data-image', product.image);
    
    // Update document title
    document.title = `${product.name} - Fashion Backpack Store`;
}

/**
 * Handles the "Add to Cart" button click event
 */
function handleAddToCart() {
    const addToCartBtn = document.getElementById('addToCartBtn');
    const productId = parseInt(addToCartBtn.getAttribute('data-id'));
    const productName = addToCartBtn.getAttribute('data-name');
    const productPrice = parseFloat(addToCartBtn.getAttribute('data-price'));
    const productImage = addToCartBtn.getAttribute('data-image');
    const quantity = parseInt(document.getElementById('productQuantity').value) || 1;
    
    if (isNaN(productId) || !productName || isNaN(productPrice)) {
        showNotification('Invalid product information', 'error');
        return;
    }
    
    // Add product to cart
    addToCart(productId, productName, productPrice, productImage, quantity);
}

/**
 * Adds a product to the cart
 * @param {number} productId - Product ID
 * @param {string} productName - Product name
 * @param {number} productPrice - Product price
 * @param {string} productImage - Product image URL
 * @param {number} quantity - Quantity to add
 */
function addToCart(productId, productName, productPrice, productImage, quantity) {
    // Create product object
    const product = {
        product_id: productId,
        product_name: productName,
        product_price: productPrice,
        product_image: productImage,
        quantity: quantity
    };
    
    // Add to cart via API
    API.addToCart(product).then(result => {
        // Show success notification
        showNotification(`${productName} added to cart!`, 'success');
        
        // Refresh cart count
        loadCart();
    }).catch(error => {
        console.error('Error adding to cart:', error);
        showNotification('Failed to add product to cart', 'error');
    });
}

/**
 * Loads related products from the API
 * @param {string|number} currentProductId - The current product ID to exclude from related products
 */
function loadRelatedProducts(currentProductId) {
    const container = document.getElementById('relatedProductsContainer');
    
    // Show loading indicator
    container.innerHTML = `
        <div class="col-12 text-center">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
    
    // Fetch related products from API (we'll just get random products here)
    fetch('http://localhost:3000/api/products?limit=4')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Filter out current product
            const relatedProducts = data.products.filter(product => product.id != currentProductId);
            
            if (relatedProducts.length === 0) {
                container.innerHTML = '<p class="col-12 text-center">No related products found.</p>';
                return;
            }
            
            let productsHTML = '';
            
            // Generate HTML for related products
            relatedProducts.slice(0, 4).forEach((product, index) => {
                const delay = 0.1 + (index * 0.1);
                const discountBadge = product.discount_percent 
                    ? `<div class="bg-secondary rounded text-white position-absolute start-0 top-0 m-4 py-1 px-3">-${product.discount_percent}%</div>`
                    : `<div class="bg-secondary rounded text-white position-absolute start-0 top-0 m-4 py-1 px-3">New</div>`;

                const originalPrice = product.original_price 
                    ? `<span class="text-body text-decoration-line-through">${formatPrice(product.original_price)} đ</span>`
                    : '';

                productsHTML += `
                    <div class="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="${delay}s">
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
                                    <a class="text-body" href="product-details.html?id=${product.id}">
                                        <i class="fa fa-eye text-primary me-2"></i>View details
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
            });
            
            container.innerHTML = productsHTML;
            
            // Initialize WOW animations
            new WOW().init();
            
            // Setup add to cart buttons again
            setupAddToCartButtons();
        })
        .catch(error => {
            console.error('Error loading related products:', error);
            container.innerHTML = '<p class="col-12 text-center">Error loading related products.</p>';
        });
}

/**
 * Shows an error message on the page
 * @param {string} message - The error message to display
 */
function showError(message) {
    document.getElementById('productLoadingSpinner').classList.add('d-none');
    
    const errorHTML = `
        <div class="alert alert-danger text-center my-5">
            <i class="fa fa-exclamation-triangle me-2"></i>${message}
            <div class="mt-3">
                <a href="product.html" class="btn btn-primary">Back to Products</a>
            </div>
        </div>
    `;
    
    const container = document.getElementById('productDetailsContainer').parentNode;
    container.innerHTML = errorHTML;
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

/**
 * Formats price with thousands separators
 * @param {number} price - The price to format
 * @returns {string} Formatted price string
 */
function formatPrice(price) {
    return parseFloat(price).toLocaleString('vi-VN');
}