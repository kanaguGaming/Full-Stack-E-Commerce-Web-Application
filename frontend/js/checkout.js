async function handleCheckout(event) {
    event.preventDefault();
    
    if (!getToken()) {
        showToast('Please login to place an order', 'error');
        window.location.href = 'login.html';
        return;
    }

    if (cart.length === 0) {
        showToast('Your cart is empty', 'error');
        return;
    }

    const form = event.target;
    const orderData = {
        delivery_address: form.address.value,
        phone: form.phone.value,
        city: form.city.value,
        pincode: form.pincode.value,
        items: cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity
        }))
    };

    try {
        const response = await fetchWithAuth('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            const result = await response.json();
            clearCart();
            showToast('Order placed successfully!');
            setTimeout(() => {
                window.location.href = 'orders.html';
            }, 1500);
        } else {
            const err = await response.json();
            showToast(err.detail || 'Failed to place order', 'error');
        }
    } catch (error) {
        showToast('Network error occurred', 'error');
    }
}
