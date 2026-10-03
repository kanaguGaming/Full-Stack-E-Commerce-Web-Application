async function fetchOrders() {
    try {
        const response = await fetchWithAuth('/orders');
        if (!response.ok) throw new Error('Failed to fetch orders');
        return await response.json();
    } catch (error) {
        showToast(error.message, 'error');
        return [];
    }
}

function getStatusBadge(status) {
    const statusMap = {
        'Order Placed': 'badge-primary',
        'Confirmed': 'badge-primary',
        'Processing': 'badge-warning',
        'Shipped': 'badge-warning',
        'Out for Delivery': 'badge-warning',
        'Delivered': 'badge-success',
        'Cancelled': 'badge-danger'
    };
    const colorClass = statusMap[status] || 'badge-primary';
    return `<span class="badge ${colorClass}">${status}</span>`;
}

function getTimelineHtml(currentStatus) {
    const statuses = ['Order Placed', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
    
    if (currentStatus === 'Cancelled') {
        return `<div class="timeline"><div class="timeline-item active"><div class="timeline-content">Order Cancelled</div></div></div>`;
    }

    let currentIndex = statuses.indexOf(currentStatus);
    if (currentIndex === -1) currentIndex = 0;

    let html = '<div class="timeline">';
    statuses.forEach((status, index) => {
        if (index <= currentIndex) {
            html += `
            <div class="timeline-item active">
                <div class="timeline-content">${status}</div>
            </div>`;
        }
    });
    html += '</div>';
    return html;
}
