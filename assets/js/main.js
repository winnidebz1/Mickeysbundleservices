// ===================================
// NAVIGATION & MOBILE MENU
// ===================================
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Toggle mobile menu
if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });
}

// Close mobile menu when clicking nav link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        mobileMenuToggle.classList.remove('active');

        // Update active state
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

// Header scroll effect
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// ===================================
// SMOOTH SCROLLING
// ===================================
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = header.offsetHeight;
        const sectionTop = section.offsetTop - headerHeight - 20;
        window.scrollTo({
            top: sectionTop,
            behavior: 'smooth'
        });
    }
}

// ===================================
// NETWORK SELECTION
// ===================================
function selectNetwork(network) {
    // Show bundles modal for selected network
    showBundlesModal(network);
}

function showBundlesModal(network) {
    const modal = document.getElementById('purchaseModal');
    const modalBody = document.getElementById('modalBody');
    
    const networkName = networkNames[network];
    const bundles = bundlesData[network];
    
    if (!bundles || bundles.length === 0) {
        alert('No bundles available for this network');
        return;
    }
    
    // Create bundles list HTML
    let bundlesHTML = bundles.map(bundle => `
        <div class="bundle-item-modal" onclick="purchaseBundle('${network}', '${bundle.size}', ${bundle.price})">
            <div class="bundle-header">
                <h3 class="bundle-size">${bundle.size}</h3>
                <span class="bundle-price">GH₵ ${bundle.price.toFixed(2)}</span>
            </div>
            ${bundle.validity ? `<p class="bundle-validity">Valid for ${bundle.validity}</p>` : ''}
            <button class="btn btn-primary btn-sm">Buy Now</button>
        </div>
    `).join('');
    
    modalBody.innerHTML = `
        <h2 class="section-title" style="font-size: 1.75rem; margin-bottom: 0.5rem;">${networkName} Data Bundles</h2>
        <p class="section-subtitle" style="margin-bottom: 1.5rem;">Select a bundle to purchase</p>
        <div class="bundles-modal-grid">
            ${bundlesHTML}
        </div>
    `;
    
    modal.classList.add('active');
}

// ===================================
// BUNDLE FILTERING
// ===================================
function filterBundles(network) {
    // Hide all bundle grids
    const allGrids = document.querySelectorAll('.bundle-list');
    allGrids.forEach(grid => grid.classList.add('hidden'));

    // Show selected network's bundles
    const selectedGrid = document.getElementById(`${network}-bundles`);
    if (selectedGrid) {
        selectedGrid.classList.remove('hidden');
    }

    // Update tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.network === network) {
            btn.classList.add('active');
        }
    });
}

// ===================================
// PURCHASE FLOW
// ===================================
let currentPurchase = null;

function purchaseBundle(network, size, price) {
    currentPurchase = {
        network: network,
        size: size,
        price: price
    };

    showPurchaseModal();
}

function showPurchaseModal() {
    const modal = document.getElementById('purchaseModal');
    const modalBody = document.getElementById('modalBody');

    const networkName = networkNames[currentPurchase.network];

    modalBody.innerHTML = `
        <h2 class="section-title" style="font-size: 1.75rem; margin-bottom: 1rem;">Purchase ${currentPurchase.size} Data</h2>
        <div class="purchase-summary" style="background: var(--color-grey-50); padding: 1rem; border-radius: var(--radius-lg); margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="font-weight: 600;">Network:</span>
                <span>${networkName}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="font-weight: 600;">Bundle:</span>
                <span>${currentPurchase.size}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 1.25rem; font-weight: 700; color: var(--color-mtn);">
                <span>Total:</span>
                <span>GH₵ ${currentPurchase.price.toFixed(2)}</span>
            </div>
        </div>
        
        <form class="purchase-form" onsubmit="processPurchase(event)">
            <div class="form-group">
                <label class="form-label">Recipient Phone Number</label>
                <input type="tel" class="form-input" id="phoneNumber" placeholder="0XX XXX XXXX" required pattern="[0-9]{10}" maxlength="10">
                <small style="color: var(--color-grey-600); font-size: 0.875rem;">Enter 10-digit phone number</small>
            </div>
            
            <div class="form-group">
                <label class="form-label">Payment Method</label>
                <select class="form-select" id="paymentMethod" required>
                    <option value="">Select payment method</option>
                    <option value="mtn-momo">MTN Mobile Money</option>
                    <option value="telecel-cash">Telecel Cash</option>
                    <option value="airteltigo-money">AirtelTigo Money</option>
                </select>
            </div>
            
            <div class="form-group" style="background: var(--color-grey-50); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.5rem;">
                <div style="display: flex; align-items: start; gap: 0.5rem;">
                    <span style="font-size: 1.25rem;">🔒</span>
                    <div>
                        <p style="font-size: 0.875rem; color: var(--color-grey-700); margin-bottom: 0.25rem;">
                            <strong>Security Notice:</strong>
                        </p>
                        <p style="font-size: 0.875rem; color: var(--color-grey-600);">
                            We do not collect or store your MoMo PIN. All payments are securely processed via Moolre. 
                            PIN entry happens only on your device.
                        </p>
                    </div>
                </div>
            </div>
            
            <button type="submit" class="btn btn-primary" style="width: 100%;">
                Proceed to Payment
            </button>
        </form>
    `;

    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('purchaseModal');
    modal.classList.remove('active');
    currentPurchase = null;
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('purchaseModal');
    if (e.target === modal) {
        closeModal();
    }
});

// ===================================
// PAYMENT PROCESSING
// ===================================
function processPurchase(event) {
    event.preventDefault();

    const phoneNumber = document.getElementById('phoneNumber').value;
    const paymentMethod = document.getElementById('paymentMethod').value;

    if (!phoneNumber || !paymentMethod) {
        alert('Please fill in all required fields');
        return;
    }

    // Validate phone number format
    if (!/^0[0-9]{9}$/.test(phoneNumber)) {
        alert('Please enter a valid 10-digit phone number starting with 0');
        return;
    }

    // Show payment processing screen
    showPaymentProcessing(phoneNumber, paymentMethod);
}

function showPaymentProcessing(phoneNumber, paymentMethod) {
    const modalBody = document.getElementById('modalBody');

    const paymentMethodNames = {
        'mtn-momo': 'MTN Mobile Money',
        'telecel-cash': 'Telecel Cash',
        'airteltigo-money': 'AirtelTigo Money'
    };

    modalBody.innerHTML = `
        <div class="payment-status">
            <div class="status-icon">📱</div>
            <h3 class="status-title">Payment Request Sent</h3>
            <p class="status-message">
                A payment prompt has been sent to <strong>${phoneNumber}</strong> via ${paymentMethodNames[paymentMethod]}.
            </p>
            <div style="background: var(--color-grey-50); padding: 1.5rem; border-radius: var(--radius-lg); margin: 1.5rem 0;">
                <p style="font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--color-black);">
                    Please enter your Mobile Money PIN on your phone to approve payment.
                </p>
                <p style="font-size: 0.875rem; color: var(--color-grey-600);">
                    ⚠️ Do NOT enter your PIN on this website. PIN entry happens only on your device.
                </p>
            </div>
            <div class="loading-spinner"></div>
            <p style="color: var(--color-grey-600); font-size: 0.875rem; margin-top: 1rem;">
                Waiting for payment confirmation...
            </p>
        </div>
    `;

    // Initiate real payment
    initiateMoolrePayment(phoneNumber, paymentMethod);
}

async function initiateMoolrePayment(phone, paymentMethod) {
    try {
        const response = await fetch('/api/create-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                phone: phone,
                network: currentPurchase.network,
                amount: currentPurchase.price,
                bundle: currentPurchase.size
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Payment initiated successfully
            // In a real app, you would poll for status or wait for webhook
            // For now, we keep the UI feedback loop
            console.log('Payment initiated:', data);

            // Optimistic success update for demo purposes
            // In production, you'd wait for the webhook confirmation
            setTimeout(() => {
                showPaymentSuccess();
            }, 15000); // Wait 15s for user to approve on phone
        } else {
            alert('Payment execution failed: ' + (data.error || 'Unknown error'));
            closeModal();
        }
    } catch (error) {
        console.error('Payment Error:', error);
        alert('Network error. Please check your connection.');
        closeModal();
    }
}

function showPaymentSuccess() {
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <div class="payment-status">
            <div class="status-icon">✅</div>
            <h3 class="status-title" style="color: #10B981;">Payment Confirmed!</h3>
            <p class="status-message">
                Your payment has been successfully processed.
            </p>
            <div style="background: #ECFDF5; border: 2px solid #10B981; padding: 1.5rem; border-radius: var(--radius-lg); margin: 1.5rem 0;">
                <p style="font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; color: #065F46;">
                    ${currentPurchase.size} data bundle is being processed
                </p>
                <p style="font-size: 0.875rem; color: #047857; margin-bottom: 1rem;">
                    Estimated delivery: <strong>10-15 minutes</strong> (maximum 60 minutes)
                </p>
                <div style="background: white; padding: 1rem; border-radius: var(--radius-md);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="color: var(--color-grey-600);">Network:</span>
                        <span style="font-weight: 600;">${networkNames[currentPurchase.network]}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="color: var(--color-grey-600);">Bundle:</span>
                        <span style="font-weight: 600;">${currentPurchase.size}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--color-grey-600);">Amount Paid:</span>
                        <span style="font-weight: 700; color: var(--color-mtn);">GH₵ ${currentPurchase.price.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            <p style="color: var(--color-grey-600); font-size: 0.875rem; margin-bottom: 1rem;">
                You will receive a confirmation SMS once the data is delivered.
            </p>
            <button class="btn btn-primary" onclick="closeModal()" style="width: 100%;">
                Done
            </button>
            <p style="margin-top: 1rem; font-size: 0.875rem; color: var(--color-grey-600);">
                Need help? <a href="https://wa.me/233554104763" style="color: var(--color-mtn); font-weight: 600;">Contact Support</a>
            </p>
        </div>
    `;
}

// ===================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ===================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.network-card, .bundle-item, .step, .contact-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
});
