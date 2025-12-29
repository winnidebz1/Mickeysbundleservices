// ===================================
// NETWORK NAMES MAPPING
// ===================================
const networkNames = {
    'mtn': 'MTN',
    'mtn-afa': 'MTN AFA',
    'airteltigo': 'AirtelTigo'
};

// ===================================
// REAL-TIME DATA STORAGE
// ===================================
// Transactions are now loaded from API in real-time
let transactions = [];

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
                    <span class="detail-label">Recipient Phone:</span>
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
        // Clear session
        sessionStorage.removeItem('adminAuthenticated');
        sessionStorage.removeItem('adminLoginTime');

        // Redirect to login page
        window.location.href = 'admin-login.html';
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

    // Mobile menu functionality
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('adminSidebar');
    const sidebarClose = document.getElementById('sidebarClose');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function () {
            sidebar.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }

    if (sidebarClose) {
        sidebarClose.addEventListener('click', function () {
            sidebar.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
        });
    }

    // Close sidebar when clicking on nav items on mobile
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function () {
            if (window.innerWidth <= 968) {
                sidebar.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            }
        });
    });

    // Close sidebar when clicking overlay (outside sidebar)
    document.addEventListener('click', function (e) {
        if (window.innerWidth <= 968 &&
            sidebar.classList.contains('active') &&
            !sidebar.contains(e.target) &&
            !mobileMenuToggle.contains(e.target)) {
            sidebar.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
        }
    });

    // Load real-time data immediately
    console.log('🔄 Loading real-time data...');
    fetchRealOrders().then(() => {
        loadDashboard();
    });

    // Auto-refresh orders every 10 seconds for real-time updates
    setInterval(() => {
        console.log('🔄 Auto-refreshing data...');
        fetchRealOrders();
    }, 10000); // 10 seconds for more real-time feel
});

// ===================================
// DATA FETCHING - REAL-TIME
// ===================================
async function fetchRealOrders() {
    try {
        const response = await fetch('/api/orders');
        if (!response.ok) {
            console.log('API not available, using local data only');
            return;
        }

        const data = await response.json();
        if (data.success && data.orders && data.orders.length > 0) {
            // Replace transactions with fresh data from API
            const apiTransactions = data.orders.map(order => {
                // Parse amount if it's the 12-digit string
                let amt = parseFloat(order.amount);
                if (order.amount && typeof order.amount === 'string' && order.amount.length === 12) {
                    amt = amt / 100;
                }

                return {
                    id: order.id,
                    date: new Date(order.timestamp || Date.now()),
                    phone: order.recipientPhone || order.paymentPhone || 'Unknown',
                    network: order.network || 'mtn',
                    bundle: order.bundle || 'Unknown Bundle',
                    paymentMethod: 'Mobile Money',
                    amount: amt || 0,
                    status: order.status === 'paid' ? 'successful' : (order.status || 'pending')
                };
            });

            // Sort by date (newest first)
            apiTransactions.sort((a, b) => b.date - a.date);

            // Update transactions array
            transactions = apiTransactions;

            // Refresh current view
            updateStats();
            const currentSection = document.querySelector('.admin-section.active');
            if (currentSection) {
                const sectionName = currentSection.id.replace('-section', '');
                if (sectionName === 'dashboard') loadDashboard();
                if (sectionName === 'transactions') loadAllTransactions();
                if (sectionName === 'pending') loadPendingOrders();
            }

            console.log(`✅ Loaded ${transactions.length} orders from API`);
        } else {
            console.log('No orders found in API');
        }
    } catch (e) {
        console.log("API not available:", e.message);
    }
}

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
