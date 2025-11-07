// Global variables
let currentUser = null;
let authToken = null;
let products = [];
let categories = [];
let cart = [];
let wishlist = [];
let currentView = 'home';
let currentFilters = {
    category: '',
    minPrice: 0,
    maxPrice: 500,
    search: '',
    sortBy: 'name'
};

// API Base URL
const API_BASE = '/api';

// DOM Elements
const elements = {
    // Navigation
    userMenu: document.getElementById('userMenu'),
    userText: document.getElementById('userText'),
    wishlistIcon: document.getElementById('wishlistIcon'),
    wishlistBadge: document.getElementById('wishlistBadge'),
    cartIcon: document.getElementById('cartIcon'),
    cartBadge: document.getElementById('cartBadge'),
    searchInput: document.getElementById('searchInput'),

    // Main content
    mainContent: document.getElementById('mainContent'),
    productsSection: document.getElementById('productsSection'),
    productsTitle: document.getElementById('productsTitle'),
    productsCount: document.getElementById('productsCount'),

    // Buttons
    shopNowBtn: document.getElementById('shopNowBtn'),
    viewWishlistBtn: document.getElementById('viewWishlistBtn'),
    backToHomeBtn: document.getElementById('backToHomeBtn'),

    // Grids
    categoriesGrid: document.getElementById('categoriesGrid'),
    productsGrid: document.getElementById('productsGrid'),
    featuredProductsGrid: document.getElementById('featuredProductsGrid'),

    // Filters
    categoryFilters: document.getElementById('categoryFilters'),
    minPrice: document.getElementById('minPrice'),
    maxPrice: document.getElementById('maxPrice'),
    minPriceLabel: document.getElementById('minPriceLabel'),
    maxPriceLabel: document.getElementById('maxPriceLabel'),
    sortSelect: document.getElementById('sortSelect'),
    clearFiltersBtn: document.getElementById('clearFiltersBtn'),

    // Modals and Sidebars
    authModal: document.getElementById('authModal'),
    cartSidebar: document.getElementById('cartSidebar'),
    wishlistSidebar: document.getElementById('wishlistSidebar'),
    loadingOverlay: document.getElementById('loadingOverlay')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

async function initializeApp() {
    showLoading();

    try {
        // Check for stored auth token
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('currentUser');

        if (storedToken && storedUser) {
            authToken = storedToken;
            currentUser = JSON.parse(storedUser);
            updateUserUI();
        }

        // Load initial data
        await Promise.all([
            loadCategories(),
            loadFeaturedProducts()
        ]);

        if (currentUser) {
            await Promise.all([
                loadCart(),
                loadWishlist()
            ]);
        }

    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Failed to load application data');
    } finally {
        hideLoading();
    }
}

function setupEventListeners() {
    // Navigation events
    elements.userMenu.addEventListener('click', handleUserMenuClick);
    elements.wishlistIcon.addEventListener('click', () => toggleSidebar('wishlist'));
    elements.cartIcon.addEventListener('click', () => toggleSidebar('cart'));
    elements.searchInput.addEventListener('input', debounce(handleSearch, 300));

    // Button events
    elements.shopNowBtn.addEventListener('click', () => switchView('products'));
    elements.viewWishlistBtn.addEventListener('click', () => toggleSidebar('wishlist'));
    elements.backToHomeBtn.addEventListener('click', () => switchView('home'));

    // Filter events
    elements.minPrice.addEventListener('input', updatePriceLabels);
    elements.maxPrice.addEventListener('input', updatePriceLabels);
    elements.minPrice.addEventListener('change', applyFilters);
    elements.maxPrice.addEventListener('change', applyFilters);
    elements.sortSelect.addEventListener('change', applyFilters);
    elements.clearFiltersBtn.addEventListener('click', clearFilters);

    // Modal events
    setupAuthModal();
    setupSidebars();
}

// Authentication functions
function setupAuthModal() {
    const modal = elements.authModal;
    const closeBtn = document.getElementById('closeAuthModal');
    const emailCheckForm = document.getElementById('emailCheckForm');
    const authForm = document.getElementById('authForm');
    const backToEmailBtn = document.getElementById('backToEmailBtn');

    closeBtn.addEventListener('click', () => closeModal('auth'));

    emailCheckForm.addEventListener('submit', handleEmailCheck);
    authForm.addEventListener('submit', handleAuthSubmit);
    backToEmailBtn.addEventListener('click', resetAuthModal);

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal('auth');
    });
}

async function handleEmailCheck(e) {
    e.preventDefault();

    const email = document.getElementById('emailInput').value;
    const continueBtn = document.getElementById('continueBtn');
    const btnText = continueBtn.querySelector('.btn-text');
    const btnLoader = continueBtn.querySelector('.btn-loader');

    // Show loading state
    btnText.style.display = 'none';
    btnLoader.style.display = 'flex';
    continueBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/auth/check-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        // Update UI based on response
        document.getElementById('emailDisplay').value = email;
        document.getElementById('emailCheckForm').style.display = 'none';
        document.getElementById('authForm').style.display = 'block';

        const authTitle = document.getElementById('authTitle');
        const authSubtitle = document.getElementById('authSubtitle');
        const nameGroup = document.getElementById('nameGroup');
        const authSubmitBtn = document.getElementById('authSubmitBtn');
        const authStatus = document.getElementById('authStatus');

        if (data.exists) {
            // User exists - show login form
            authTitle.textContent = 'Welcome Back!';
            authSubtitle.textContent = 'Sign in to your account';
            nameGroup.style.display = 'none';
            authSubmitBtn.querySelector('.btn-text').textContent = 'Sign In';

            authStatus.style.display = 'block';
            authStatus.className = 'auth-status info';
            authStatus.textContent = 'Account found! Please enter your password to sign in.';
        } else {
            // New user - show registration form
            authTitle.textContent = 'Create Account';
            authSubtitle.textContent = 'Create your new account';
            nameGroup.style.display = 'block';
            authSubmitBtn.querySelector('.btn-text').textContent = 'Create Account';

            authStatus.style.display = 'block';
            authStatus.className = 'auth-status success';
            authStatus.textContent = 'New user detected! Please fill in your details to create an account.';
        }

    } catch (error) {
        console.error('Error checking email:', error);
        showAuthError('Failed to check email. Please try again.');
    } finally {
        // Reset button state
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        continueBtn.disabled = false;
    }
}

async function handleAuthSubmit(e) {
    e.preventDefault();

    const email = document.getElementById('emailDisplay').value;
    const password = document.getElementById('passwordInput').value;
    const name = document.getElementById('nameInput').value;
    const isLogin = document.getElementById('nameGroup').style.display === 'none';

    const submitBtn = document.getElementById('authSubmitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    // Show loading state
    btnText.style.display = 'none';
    btnLoader.style.display = 'flex';
    submitBtn.disabled = true;

    try {
        const endpoint = isLogin ? '/auth/login' : '/auth/register';
        const body = isLogin ? { email, password } : { name, email, password };

        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (response.ok) {
            // Success - store auth data
            authToken = data.token;
            currentUser = {
                id: data.id,
                name: data.name,
                email: data.email
            };

            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            // Update UI
            updateUserUI();
            closeModal('auth');

            // Load user data
            await Promise.all([
                loadCart(),
                loadWishlist()
            ]);

            showSuccess(isLogin ? 'Welcome back!' : 'Account created successfully!');
        } else {
            showAuthError(data.error || 'Authentication failed');
        }

    } catch (error) {
        console.error('Error during authentication:', error);
        showAuthError('Authentication failed. Please try again.');
    } finally {
        // Reset button state
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        submitBtn.disabled = false;
    }
}

function resetAuthModal() {
    document.getElementById('emailCheckForm').style.display = 'block';
    document.getElementById('authForm').style.display = 'none';
    document.getElementById('authStatus').style.display = 'none';
    document.getElementById('emailInput').value = '';
    document.getElementById('nameInput').value = '';
    document.getElementById('passwordInput').value = '';
    hideAuthError();
}

function handleUserMenuClick() {
    if (currentUser) {
        // Show user menu or logout
        if (confirm('Do you want to logout?')) {
            logout();
        }
    } else {
        // Show auth modal
        openModal('auth');
    }
}

function logout() {
    currentUser = null;
    authToken = null;
    cart = [];
    wishlist = [];

    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');

    updateUserUI();
    updateCartUI();
    updateWishlistUI();

    showSuccess('Logged out successfully');
}

function updateUserUI() {
    if (currentUser) {
        elements.userText.textContent = currentUser.name;
        elements.userMenu.title = 'Click to logout';
    } else {
        elements.userText.textContent = 'Sign In';
        elements.userMenu.title = 'Click to sign in';
    }
}

// Product loading functions
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/products/categories`);
        categories = await response.json();
        renderCategories();
        renderCategoryFilters();
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function loadFeaturedProducts() {
    try {
        const response = await fetch(`${API_BASE}/products?size=4`);
        const data = await response.json();
        renderFeaturedProducts(data.content || []);
    } catch (error) {
        console.error('Error loading featured products:', error);
    }
}

async function loadProducts() {
    try {
        const params = new URLSearchParams({
            page: '0',
            size: '12',
            sortBy: currentFilters.sortBy
        });

        if (currentFilters.category) params.append('category', currentFilters.category);
        if (currentFilters.search) params.append('search', currentFilters.search);
        if (currentFilters.minPrice > 0) params.append('minPrice', currentFilters.minPrice);
        if (currentFilters.maxPrice < 500) params.append('maxPrice', currentFilters.maxPrice);

        const response = await fetch(`${API_BASE}/products?${params}`);
        const data = await response.json();

        products = data.content || [];
        renderProducts(products);
        updateProductsCount(data.totalElements || 0);

    } catch (error) {
        console.error('Error loading products:', error);
        showError('Failed to load products');
    }
}

// Cart functions
async function loadCart() {
    if (!currentUser) return;

    try {
        const response = await fetch(`${API_BASE}/cart`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            cart = await response.json();
            updateCartUI();
        }
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

async function addToCart(productId, quantity = 1) {
    if (!currentUser) {
        openModal('auth');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ productId, quantity })
        });

        if (response.ok) {
            await loadCart();
            showSuccess('Added to cart!');
        } else {
            throw new Error('Failed to add to cart');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showError('Failed to add to cart');
    }
}

async function updateCartQuantity(cartItemId, quantity) {
    try {
        const response = await fetch(`${API_BASE}/cart/${cartItemId}?quantity=${quantity}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            await loadCart();
        }
    } catch (error) {
        console.error('Error updating cart:', error);
    }
}

async function removeFromCart(cartItemId) {
    try {
        const response = await fetch(`${API_BASE}/cart/${cartItemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            await loadCart();
            showSuccess('Removed from cart');
        }
    } catch (error) {
        console.error('Error removing from cart:', error);
    }
}

// Wishlist functions
async function loadWishlist() {
    if (!currentUser) return;

    try {
        const response = await fetch(`${API_BASE}/wishlist`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            wishlist = await response.json();
            updateWishlistUI();
        }
    } catch (error) {
        console.error('Error loading wishlist:', error);
    }
}

async function toggleWishlist(productId) {
    if (!currentUser) {
        openModal('auth');
        return;
    }

    const isInWishlist = wishlist.some(item => item.product.id === productId);

    try {
        const response = await fetch(`${API_BASE}/wishlist/${productId}`, {
            method: isInWishlist ? 'DELETE' : 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            await loadWishlist();
            showSuccess(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist!');
        }
    } catch (error) {
        console.error('Error toggling wishlist:', error);
        showError('Failed to update wishlist');
    }
}

// Rendering functions
function renderCategories() {
    const categoryIcons = {
        'Electronics': { icon: 'fas fa-headphones', gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)' },
        'Clothing': { icon: 'fas fa-tshirt', gradient: 'linear-gradient(135deg, #ec4899, #f97316)' },
        'Accessories': { icon: 'fas fa-watch', gradient: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' },
        'Food & Beverage': { icon: 'fas fa-coffee', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
        'Lifestyle': { icon: 'fas fa-wallet', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
        'Tech': { icon: 'fas fa-mobile-alt', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }
    };

    elements.categoriesGrid.innerHTML = categories.map(category => {
        const categoryData = categoryIcons[category] || { icon: 'fas fa-tag', gradient: 'linear-gradient(135deg, #6b7280, #4b5563)' };
        return `
            <div class="category-card" onclick="selectCategory('${category}')">
                <div class="category-icon" style="background: ${categoryData.gradient}">
                    <i class="${categoryData.icon}"></i>
                </div>
                <h3>${category}</h3>
                <p>Premium Products</p>
            </div>
        `;
    }).join('');
}

function renderCategoryFilters() {
    elements.categoryFilters.innerHTML = `
        <label>
            <input type="radio" name="category" value="" ${!currentFilters.category ? 'checked' : ''}>
            All Categories
        </label>
        ${categories.map(category => `
            <label>
                <input type="radio" name="category" value="${category}" ${currentFilters.category === category ? 'checked' : ''}>
                ${category}
            </label>
        `).join('')}
    `;

    // Add event listeners
    elements.categoryFilters.querySelectorAll('input[name="category"]').forEach(input => {
        input.addEventListener('change', (e) => {
            currentFilters.category = e.target.value;
            applyFilters();
        });
    });
}

function renderProducts(products) {
    if (products.length === 0) {
        elements.productsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-search" style="font-size: 4rem; color: #d1d5db; margin-bottom: 1rem;"></i>
                <h3 style="font-size: 1.5rem; color: #1e293b; margin-bottom: 0.5rem;">No products found</h3>
                <p style="color: #64748b;">Try adjusting your search or filters.</p>
            </div>
        `;
        return;
    }

    elements.productsGrid.innerHTML = products.map(product => {
        const isInWishlist = wishlist.some(item => item.product.id === product.id);
        return createProductCard(product, isInWishlist);
    }).join('');
}

function renderFeaturedProducts(products) {
    elements.featuredProductsGrid.innerHTML = products.map(product => {
        const isInWishlist = wishlist.some(item => item.product.id === product.id);
        return createProductCard(product, isInWishlist);
    }).join('');
}

function createProductCard(product, isInWishlist = false) {
    const stars = Array.from({ length: 5 }, (_, i) =>
        `<i class="fas fa-star star ${i < Math.floor(product.rating) ? '' : 'empty'}"></i>`
    ).join('');

    return `
        <div class="product-card fade-in">
            <div class="product-image">
                <img src="${product.imageUrl}" alt="${product.name}">
                <button class="wishlist-btn ${isInWishlist ? 'active' : ''}" onclick="toggleWishlist(${product.id})" title="${isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}">
                    <i class="fas fa-heart"></i>
                </button>
                ${product.stock < 10 ? `<div class="stock-badge">Only ${product.stock} left!</div>` : ''}
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-rating">
                    <div class="stars">${stars}</div>
                    <span class="rating-text">${product.rating} (${product.reviewCount} reviews)</span>
                </div>
                <div class="product-footer">
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i>
                        <span>${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// UI update functions
function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    elements.cartBadge.textContent = totalItems;
    elements.cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';

    // Update cart sidebar
    const cartItemCount = document.getElementById('cartItemCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const emptyCart = document.getElementById('emptyCart');
    const cartFooter = document.getElementById('cartFooter');

    cartItemCount.textContent = `${totalItems} items`;
    cartTotal.textContent = `$${totalPrice.toFixed(2)}`;

    if (cart.length === 0) {
        emptyCart.style.display = 'block';
        cartItems.style.display = 'none';
        cartFooter.style.display = 'none';
    } else {
        emptyCart.style.display = 'none';
        cartItems.style.display = 'block';
        cartFooter.style.display = 'block';

        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.product.imageUrl}" alt="${item.product.name}" class="item-image">
                <div class="item-info">
                    <div class="item-name">${item.product.name}</div>
                    <div class="item-price">$${item.product.price.toFixed(2)} each</div>
                    <div class="item-price" style="font-weight: 600; color: #3b82f6;">$${(item.product.price * item.quantity).toFixed(2)}</div>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <button class="action-btn danger" onclick="removeFromCart(${item.id})" title="Remove from cart">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }
}

function updateWishlistUI() {
    elements.wishlistBadge.textContent = wishlist.length;
    elements.wishlistBadge.style.display = wishlist.length > 0 ? 'flex' : 'none';

    // Update wishlist sidebar
    const wishlistItemCount = document.getElementById('wishlistItemCount');
    const wishlistItems = document.getElementById('wishlistItems');
    const emptyWishlist = document.getElementById('emptyWishlist');
    const wishlistFooter = document.getElementById('wishlistFooter');

    wishlistItemCount.textContent = `${wishlist.length} items`;

    if (wishlist.length === 0) {
        emptyWishlist.style.display = 'block';
        wishlistItems.style.display = 'none';
        wishlistFooter.style.display = 'none';
    } else {
        emptyWishlist.style.display = 'none';
        wishlistItems.style.display = 'block';
        wishlistFooter.style.display = 'block';

        wishlistItems.innerHTML = wishlist.map(item => `
            <div class="wishlist-item">
                <img src="${item.product.imageUrl}" alt="${item.product.name}" class="item-image">
                <div class="item-info">
                    <div class="item-name">${item.product.name}</div>
                    <div class="item-description">${item.product.description}</div>
                    <div class="item-price">$${item.product.price.toFixed(2)}</div>
                </div>
                <div class="item-actions">
                    <button class="action-btn primary" onclick="addToCart(${item.product.id}); toggleWishlist(${item.product.id})" title="Add to Cart">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                    <button class="action-btn danger" onclick="toggleWishlist(${item.product.id})" title="Remove from Wishlist">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

function updateProductsCount(count) {
    elements.productsCount.textContent = `${count} products found`;
}

function updatePriceLabels() {
    const minPrice = parseInt(elements.minPrice.value);
    const maxPrice = parseInt(elements.maxPrice.value);

    elements.minPriceLabel.textContent = `$${minPrice}`;
    elements.maxPriceLabel.textContent = `$${maxPrice}`;

    currentFilters.minPrice = minPrice;
    currentFilters.maxPrice = maxPrice;
}

// Navigation functions
function switchView(view) {
    currentView = view;

    if (view === 'home') {
        elements.productsSection.style.display = 'none';
        document.querySelector('.hero').style.display = 'block';
        document.querySelector('.categories').style.display = 'block';
        document.querySelector('.featured-products').style.display = 'block';
    } else if (view === 'products') {
        elements.productsSection.style.display = 'block';
        document.querySelector('.hero').style.display = 'none';
        document.querySelector('.categories').style.display = 'none';
        document.querySelector('.featured-products').style.display = 'none';

        loadProducts();
    }
}

function selectCategory(category) {
    currentFilters.category = category;
    elements.productsTitle.textContent = category || 'All Products';
    switchView('products');
}

// Filter functions
function applyFilters() {
    currentFilters.sortBy = elements.sortSelect.value;
    currentFilters.minPrice = parseInt(elements.minPrice.value);
    currentFilters.maxPrice = parseInt(elements.maxPrice.value);

    if (currentView === 'products') {
        loadProducts();
    }
}

function clearFilters() {
    currentFilters = {
        category: '',
        minPrice: 0,
        maxPrice: 500,
        search: '',
        sortBy: 'name'
    };

    elements.minPrice.value = 0;
    elements.maxPrice.value = 500;
    elements.sortSelect.value = 'name';
    elements.searchInput.value = '';

    updatePriceLabels();
    renderCategoryFilters();

    if (currentView === 'products') {
        elements.productsTitle.textContent = 'All Products';
        loadProducts();
    }
}

function handleSearch() {
    currentFilters.search = elements.searchInput.value;
    if (currentView === 'products') {
        loadProducts();
    } else if (currentFilters.search) {
        switchView('products');
    }
}

// Modal and sidebar functions
function openModal(type) {
    const modal = document.getElementById(`${type}Modal`);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(type) {
    const modal = document.getElementById(`${type}Modal`);
    modal.classList.remove('active');
    document.body.style.overflow = '';

    if (type === 'auth') {
        resetAuthModal();
    }
}

function toggleSidebar(type) {
    const sidebar = document.getElementById(`${type}Sidebar`);
    const isActive = sidebar.classList.contains('active');

    // Close all sidebars first
    document.querySelectorAll('.sidebar').forEach(s => s.classList.remove('active'));

    if (!isActive) {
        sidebar.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

function setupSidebars() {
    // Cart sidebar
    document.getElementById('closeCartSidebar').addEventListener('click', () => toggleSidebar('cart'));
    document.getElementById('startShoppingBtn').addEventListener('click', () => {
        toggleSidebar('cart');
        switchView('products');
    });
    document.getElementById('continueShoppingBtn').addEventListener('click', () => toggleSidebar('cart'));

    // Wishlist sidebar
    document.getElementById('closeWishlistSidebar').addEventListener('click', () => toggleSidebar('wishlist'));
    document.getElementById('startBrowsingBtn').addEventListener('click', () => {
        toggleSidebar('wishlist');
        switchView('products');
    });
    document.getElementById('continueBrowsingBtn').addEventListener('click', () => toggleSidebar('wishlist'));

    // Close sidebars when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('sidebar') && e.target.classList.contains('active')) {
            toggleSidebar(e.target.id.replace('Sidebar', ''));
        }
    });
}

// Utility functions
function showLoading() {
    elements.loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    elements.loadingOverlay.style.display = 'none';
}

function showSuccess(message) {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'toast error';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function showAuthError(message) {
    const errorDiv = document.getElementById('authError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function hideAuthError() {
    const errorDiv = document.getElementById('authError');
    errorDiv.style.display = 'none';
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add CSS for toast animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);