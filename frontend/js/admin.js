if (getRole() !== 'ADMIN') {
    window.location.href = 'index.html';
}

async function fetchStats() {
    const res = await fetchWithAuth('/admin/statistics');
    if(res.ok) return await res.json();
    return null;
}

async function fetchAdminProducts() {
    const res = await fetchWithAuth('/admin/products');
    if(res.ok) return await res.json();
    return [];
}

async function fetchAllOrders() {
    const res = await fetchWithAuth('/admin/orders');
    if(res.ok) return await res.json();
    return [];
}

async function fetchAllUsers() {
    const res = await fetchWithAuth('/admin/users');
    if(res.ok) return await res.json();
    return [];
}

async function createProduct(data) {
    return await fetchWithAuth('/products', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

async function updateProduct(id, data) {
    return await fetchWithAuth(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

async function deleteProduct(id) {
    return await fetchWithAuth(`/products/${id}`, {
        method: 'DELETE'
    });
}

async function updateOrderStatus(id, status) {
    return await fetchWithAuth(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
    });
}
