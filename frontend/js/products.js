async function fetchProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        return await response.json();
    } catch (error) {
        showToast(error.message, 'error');
        return [];
    }
}

function renderProductCard(product) {
    return `
        <div class="product-card">
            <img src="${product.image_url || 'https://via.placeholder.com/300'}" alt="${product.name}" class="product-img">
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">₹${product.price.toFixed(2)}</div>
                <div class="product-actions">
                    <button class="btn btn-primary" onclick='addToCart(${JSON.stringify(product).replace(/'/g, "&apos;")})'>Add to Cart</button>
                </div>
            </div>
        </div>
    `;
}
