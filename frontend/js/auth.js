const API_URL = 'http://127.0.0.1:8000/api';

function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function setToken(token, role) {
    localStorage.setItem('ecommerce_token', token);
    localStorage.setItem('ecommerce_role', role);
}

function getToken() {
    return localStorage.getItem('ecommerce_token');
}

function getRole() {
    return localStorage.getItem('ecommerce_role');
}

function logout() {
    localStorage.removeItem('ecommerce_token');
    localStorage.removeItem('ecommerce_role');
    window.location.href = 'login.html';
}

function updateNavAuth() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;
    
    const token = getToken();
    const role = getRole();
    
    const authLinks = navLinks.querySelectorAll('.auth-link');
    authLinks.forEach(link => link.remove());

    if (token) {
        if (role === 'ADMIN') {
            const adminLink = document.createElement('a');
            adminLink.href = 'admin.html';
            adminLink.className = 'auth-link';
            adminLink.textContent = 'Admin Dashboard';
            navLinks.insertBefore(adminLink, navLinks.lastElementChild);
        }
        
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'btn btn-outline auth-link';
        logoutBtn.textContent = 'Logout';
        logoutBtn.onclick = logout;
        navLinks.appendChild(logoutBtn);
    } else {
        const loginLink = document.createElement('a');
        loginLink.href = 'login.html';
        loginLink.className = 'btn btn-outline auth-link';
        loginLink.textContent = 'Login';
        navLinks.appendChild(loginLink);
    }
}

async function fetchWithAuth(url, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers
    });
    
    if (response.status === 401) {
        logout();
    }
    
    return response;
}

document.addEventListener('DOMContentLoaded', updateNavAuth);
