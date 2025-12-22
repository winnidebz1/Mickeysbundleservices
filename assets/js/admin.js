// ===================================
// MOCK DATA FOR DEMO
// ===================================
let transactions = [
    {
        id: 'TXN001',
        date: new Date(),
        phone: '0241234567',
        network: 'mtn',
        bundle: '5GB',
        paymentMethod: 'MTN MoMo',
        amount: 27,
        status: 'successful'
    },
    {
        id: 'TXN002',
        date: new Date(Date.now() - 300000),
        phone: '0557654321',
        network: 'airteltigo',
        bundle: '10GB',
        paymentMethod: 'AirtelTigo Money',
        amount: 50,
        status: 'pending'
    },
    {
        id: 'TXN003',
        date: new Date(Date.now() - 600000),
        phone: '0201112233',
        network: 'mtn-afa',
        bundle: '20GB',
        paymentMethod: 'MTN MoMo',
        amount: 90,
        status: 'successful'
    },
    {
        id: 'TXN004',
        date: new Date(Date.now() - 900000),
        phone: '0245556677',
        network: 'mtn',
        bundle: '2GB',
        paymentMethod: 'MTN MoMo',
        amount: 11.50,
        status: 'failed'
    },
    {
        id: 'TXN005',
        date: new Date(Date.now() - 1200000),
        phone: '0558889900',
        network: 'airteltigo',
        bundle: '15GB',
        paymentMethod: 'AirtelTigo Money',
        amount: 72,
        status: 'successful'
    }
];

// ===================================
// NAVIGATION
// ===================================
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    const section = document.getElementById(`${sectionName}-section`);
    if (section) {
        section.classList.add('active');
    }

    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.nav-item').classList.add('active');

    // Update page title
    const pageTitle = document.querySelector('.page-title');
    pageTitle.textContent = sectionName.charAt(0).toUpperCase() + sectionName.slice(1);

    // Load section data
    switch (sectionName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'transactions':
            loadAllTransactions();
            break;
        case 'pending':
            loadPendingOrders();
            break;
    }
}

// ===================================
// DASHBOARD
// ===================================
function loadDashboard() {
    updateStats();
    loadRecentTransactions();
}

function updateStats() {
    // Calculate stats
    const totalRevenue = transactions
        .filter(t => t.status === 'successful')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalOrders = transactions.length;
    const pendingOrders = transactions.filter(t => t.status === 'pending').length;
    const completedToday = transactions.filter(t => {
        const today = new Date().toDateString();
        return t.date.toDateString() === today && t.status === 'successful';
    }).length;

    // Update UI
    document.getElementById('totalRevenue').textContent = totalRevenue.toFixed(2);
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('completedToday').textContent = completedToday;
}

function loadRecentTransactions() {
    const tbody = document.getElementById('recentTransactions');
    tbody.innerHTML = '';

    // Show last 5 transactions
    const recentTxns = transactions.slice(0, 5);

    recentTxns.forEach(txn => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${txn.id}</strong></td>
            <td>${txn.phone}</td>
            <td>${networkNames[txn.network]}</td>
            <td>${txn.bundle}</td>
            <td><strong>GH₵ ${txn.amount.toFixed(2)}</strong></td>
            <td><span class="status-badge status-${txn.status}">${txn.status.toUpperCase()}</span></td>
            <td>${formatTime(txn.date)}</td>
        `;
        tbody.appendChild(row);
    });
}

// ===================================
// ALL TRANSACTIONS
// ===================================
function loadAllTransactions() {
    const tbody = document.getElementById('allTransactions');
    tbody.innerHTML = '';

    transactions.forEach(txn => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${txn.id}</strong></td>
            <td>${formatDateTime(txn.date)}</td>
            <td>${txn.phone}</td>
            <td>${networkNames[txn.network]}</td>
            <td>${txn.bundle}</td>
            <td>${txn.paymentMethod}</td>
            <td><strong>GH₵ ${txn.amount.toFixed(2)}</strong></td>
            <td><span class="status-badge status-${txn.status}">${txn.status.toUpperCase()}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-view" onclick="viewTransaction('${txn.id}')">View</button>
                    ${txn.status === 'pending' ? `<button class="btn-action btn-resend" onclick="resendData('${txn.id}')">Resend</button>` : ''}
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ===================================
// PENDING ORDERS
// ===================================
function loadPendingOrders() {
    const grid = document.getElementById('pendingGrid');
    grid.innerHTML = '';

    const pending = transactions.filter(t => t.status === 'pending');

    if (pending.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">✅</div>
                <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">All caught up!</h3>
                <p style="color: var(--color-grey-600);">No pending orders at the moment.</p>
            </div>
        `;
        return;
    }

    pending.forEach(txn => {
        const card = document.createElement('div');
        card.className = 'pending-card';
        card.innerHTML = `
            <div class="pending-header">
                <div class="pending-id">${txn.id}</div>
                <div class="pending-time">${formatTime(txn.date)}</div>
            </div>
            <div class="pending-details">
                <div class="detail-row">
                    <span class="detail-label">Customer:</span>
                    <span class="detail-value">${txn.phone}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Network:</span>
                    <span class="detail-value">${networkNames[txn.network]}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Bundle:</span>
                    <span class="detail-value">${txn.bundle}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Amount:</span>
                    <span class="detail-value">GH₵ ${txn.amount.toFixed(2)}</span>
                </div>
            </div>
            <div class="pending-actions">
                <button class="btn btn-complete" onclick="completeOrder('${txn.id}')">
                    Mark as Complete
                </button>
                <button class="btn btn-action btn-cancel" onclick="cancelOrder('${txn.id}')">
                    Cancel
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ===================================
// ACTIONS
// ===================================
function completeOrder(txnId) {
    const txn = transactions.find(t => t.id === txnId);
    if (txn) {
        txn.status = 'successful';
        loadPendingOrders();
        updateStats();
        showNotification('Order marked as complete!', 'success');
    }
}

function cancelOrder(txnId) {
    if (confirm('Are you sure you want to cancel this order?')) {
        const txn = transactions.find(t => t.id === txnId);
        if (txn) {
            txn.status = 'failed';
            loadPendingOrders();
            updateStats();
            showNotification('Order cancelled', 'error');
        }
    }
}

function viewTransaction(txnId) {
    const txn = transactions.find(t => t.id === txnId);
    if (txn) {
        alert(`Transaction Details:\n\nID: ${txn.id}\nPhone: ${txn.phone}\nNetwork: ${networkNames[txn.network]}\nBundle: ${txn.bundle}\nAmount: GH₵ ${txn.amount.toFixed(2)}\nStatus: ${txn.status}\nDate: ${formatDateTime(txn.date)}`);
    }
}

function resendData(txnId) {
    if (confirm('Resend data bundle to customer?')) {
        showNotification('Data bundle resent successfully!', 'success');
        completeOrder(txnId);
    }
}

function refreshData() {
    loadDashboard();
    showNotification('Data refreshed', 'success');
}

function refreshPending() {
    loadPendingOrders();
    showNotification('Pending orders refreshed', 'success');
}

function exportTransactions() {
    // Create CSV content
    let csv = 'Transaction ID,Date,Phone,Network,Bundle,Payment Method,Amount,Status\n';

    transactions.forEach(txn => {
        csv += `${txn.id},${formatDateTime(txn.date)},${txn.phone},${networkNames[txn.network]},${txn.bundle},${txn.paymentMethod},${txn.amount},${txn.status}\n`;
    });

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    showNotification('Transactions exported successfully!', 'success');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = 'index.html';
    }
}

// ===================================
// SEARCH & FILTER
// ===================================
document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchTransactions');
    const filterStatus = document.getElementById('filterStatus');

    if (searchInput) {
        searchInput.addEventListener('input', filterTransactions);
    }

    if (filterStatus) {
        filterStatus.addEventListener('change', filterTransactions);
    }

    // Load initial dashboard
    loadDashboard();

    // Auto-refresh pending orders every 30 seconds
    setInterval(() => {
        const currentSection = document.querySelector('.admin-section.active');
        if (currentSection && currentSection.id === 'pending-section') {
            loadPendingOrders();
        }
        updateStats(); // Update stats badge
    }, 30000); // 30 seconds
});

function filterTransactions() {
    const searchTerm = document.getElementById('searchTransactions')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('filterStatus')?.value || 'all';

    const filtered = transactions.filter(txn => {
        const matchesSearch = txn.id.toLowerCase().includes(searchTerm) ||
            txn.phone.includes(searchTerm) ||
            networkNames[txn.network].toLowerCase().includes(searchTerm);

        const matchesStatus = statusFilter === 'all' || txn.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Update table with filtered results
    const tbody = document.getElementById('allTransactions');
    if (tbody) {
        tbody.innerHTML = '';

        filtered.forEach(txn => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${txn.id}</strong></td>
                <td>${formatDateTime(txn.date)}</td>
                <td>${txn.phone}</td>
                <td>${networkNames[txn.network]}</td>
                <td>${txn.bundle}</td>
                <td>${txn.paymentMethod}</td>
                <td><strong>GH₵ ${txn.amount.toFixed(2)}</strong></td>
                <td><span class="status-badge status-${txn.status}">${txn.status.toUpperCase()}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="viewTransaction('${txn.id}')">View</button>
                        ${txn.status === 'pending' ? `<button class="btn-action btn-resend" onclick="resendData('${txn.id}')">Resend</button>` : ''}
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
}

// ===================================
// UTILITY FUNCTIONS
// ===================================
function formatTime(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

function formatDateTime(date) {
    return date.toLocaleString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10B981' : '#EF4444'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
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
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
