let cart = JSON.parse(localStorage.getItem('ecommerce_cart')) || [];

function saveCart() {
    localStorage.setItem('ecommerce_cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const countEl = document.getElementById('cart-count');
    if (countEl) {
        const total = cart.reduce((sum, item) => sum + item.quantity, 0);
        countEl.textContent = total;
        countEl.style.display = total > 0 ? 'block' : 'none';
    }
}

function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        if (existing.quantity < product.stock) {
            existing.quantity += 1;
            showToast('Increased quantity in cart');
        } else {
            showToast('Cannot add more than available stock', 'error');
            return;
        }
    } else {
        if (product.stock > 0) {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url,
                stock: product.stock,
                quantity: 1
            });
            showToast('Added to cart');
        } else {
            showToast('Out of stock', 'error');
            return;
        }
    }
    saveCart();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    if (typeof renderCart === 'function') renderCart();
}

function updateQuantity(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
        const newQuantity = item.quantity + delta;
        if (newQuantity > 0 && newQuantity <= item.stock) {
            item.quantity = newQuantity;
            saveCart();
            if (typeof renderCart === 'function') renderCart();
        } else if (newQuantity > item.stock) {
            showToast('Cannot exceed available stock', 'error');
        }
    }
}

function clearCart() {
    cart = [];
    saveCart();
}

document.addEventListener('DOMContentLoaded', updateCartCount);
