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
                <span class="bundle-price">${bundle.price.toFixed(2)}</span>
            </div>
            ${bundle.validity ? `<p class="bundle-validity">Valid for ${bundle.validity}</p>` : ''}
            <button class="btn btn-primary btn-sm">Buy Now</button>
        </div>
    `).join('');

    modalBody.innerHTML = `
        <h2 class="section-title" style="font-size: 1.75rem; margin-bottom: 0.5rem;">${networkName} Data Bundles</h2>
        <p class="section-subtitle" style="margin-bottom: 1.5rem;">Select a bundle to purchase</p>
        <div class="bundles-modal-grid" data-network="${network}">
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
                <label class="form-label">Who is receiving the data?</label>
        <form id="paymentForm" onsubmit="handlePaymentSubmit(event)">
            <div class="form-group">
                <label class="form-label">Recipient Number</label>
                <input type="tel" class="form-input" id="recipientNumber" required placeholder="05XXXXXXXX" pattern="[0-9]{10}" maxlength="10">
            </div>

            <div class="form-group">
                <label class="form-label">Momo Number for Payment</label>
                <input type="tel" class="form-input" id="paymentNumber" required placeholder="05XXXXXXXX" pattern="[0-9]{10}" maxlength="10">
            </div>
            
            <div class="form-group">
                <label class="form-label">Payment Method</label>
                <select class="form-select" id="paymentMethod">
                    <option value="mtn-momo">MTN Mobile Money</option>
                    <option value="telecel-cash">Telecel Cash</option>
                    <option value="airteltigo-money">AirtelTigo Money</option>
                </select>
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

async function initiatePayment(paymentPhone, recipientPhone, paymentMethod, gateway) {
    // Map dropdown values to backend codes
    const paymentMethodMap = {
        'mtn-momo': 'mtn',
        'telecel-cash': 'telecel',
        'airteltigo-money': 'airteltigo'
    };

    const endpoint = gateway === 'moolre' ? '/api/create-moolre-payment' : '/api/create-payment';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                paymentPhone: paymentPhone,
                recipientPhone: recipientPhone,
                network: paymentMethodMap[paymentMethod] || currentPurchase.network,
                amount: currentPurchase.price,
                bundle: currentPurchase.size
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log(`${gateway} Payment initiated:`, data);

            window.currentPaymentData = {
                paymentPhone: paymentPhone,
                recipientPhone: recipientPhone,
                paymentMethod: paymentMethod,
                gateway: gateway,
                paystackReference: data.transactionRef || data.paystackReference
            };

            // Unified Success Handler
            if (data.requireOtp) {
                showOTPInput(paymentPhone, recipientPhone, data.transactionRef, data.message);
            } else {
                showPinPrompt(recipientPhone, paymentPhone);
            }
        } else {
            alert(`Payment failed (${gateway}): ` + (data.error || 'Unknown error'));
            closeModal();
        }
    } catch (error) {
        console.error('Payment Error:', error);
        alert('Network error. Please check your connection.');
        closeModal();
    }
}




function showPaymentSuccess(recipientPhone) {
    const modalBody = document.getElementById('modalBody');

    // Create container for buttons to allow dynamic switching
    modalBody.innerHTML = `
        <div class="payment-status">
            <div class="status-icon">🚀</div>
            <h3 class="status-title" style="color: var(--color-mtn);">Authorize Payment</h3>
            <p class="status-message">
                A prompt has been sent to <strong>${document.getElementById('paymentNumber').value}</strong>.
            </p>
            <div style="background: #FFFBEB; border: 2px solid #F59E0B; padding: 1.5rem; border-radius: var(--radius-lg); margin: 1.5rem 0;">
                <p style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; color: #B45309;">
                    Step 1: Check your Phone
                </p>
                <p style="font-size: 1rem; color: #92400E; margin-bottom: 1rem;">
                    <strong>ENTER YOUR PIN</strong> on the popup to confirm the transaction.
                </p>
                <div style="background: white; padding: 1rem; border-radius: var(--radius-md);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="color: var(--color-grey-600);">Network:</span>
                        <span style="font-weight: 600;">${networkNames[currentPurchase.network]}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--color-grey-600);">Amount:</span>
                        <span style="font-weight: 700; color: var(--color-mtn);">GH₵ ${currentPurchase.price.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <button class="btn btn-primary" onclick="closeModal()" style="width: 100%;">
                    I have Entered my PIN
                </button>
            </div>
        </div>
    `;
}

function switchToOTPInput() {
    // Retrieve stored data
    if (window.currentPaymentData) {
        showOTPInput(
            window.currentPaymentData.paymentPhone,
            window.currentPaymentData.recipientPhone,
            window.currentPaymentData.paystackReference
        );
    } else {
        alert("Session expired. Please try purchasing again.");
        closeModal();
    }
}

function showOTPInput(paymentPhone, recipientPhone, reference, customMessage) {
    const modalBody = document.getElementById('modalBody');

    // Default message if Paystack didn't send one
    const displayMessage = customMessage || `A verification code has been sent to <strong>${paymentPhone}</strong>.`;

    modalBody.innerHTML = `
        <div class="payment-status">
            <div class="status-icon">📱</div>
            <h3 class="status-title">Authentication Required</h3>
            <p class="status-message" style="color: var(--color-grey-800); font-weight: 500;">
                ${displayMessage}
            </p>
            <p class="status-message" style="margin-top: 0.5rem; font-size: 0.875rem;">
                Please follow the instructions above and enter the code/token below.
            </p>
            
            <form onsubmit="submitOTP(event)" style="margin-top: 1.5rem;">
                <div class="form-group">
                    <label class="form-label">OTP / Token / Voucher Code</label>
                    <input 
                        type="text" 
                        class="form-input" 
                        id="otpCode" 
                        placeholder="Enter Code" 
                        required 
                        maxlength="10"
                        style="text-align: center; font-size: 1.5rem; letter-spacing: 0.5rem;"
                    >
                </div>
                
                <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
                    Authorize Payment
                </button>
            </form>
            
            <p style="margin-top: 1rem; font-size: 0.875rem; color: var(--color-grey-600);">
                Didn't receive code? <a href="#" onclick="resendOTP(event)" style="color: var(--color-mtn); font-weight: 600;">Restart Transaction</a>
            </p>
        </div>
    `;

    // Update global state
    window.currentPaymentData = {
        paymentPhone: paymentPhone,
        recipientPhone: recipientPhone,
        paystackReference: reference,
        // preserved other fields if needed for retry
        paymentMethod: window.currentPaymentData?.paymentMethod
    };
}

async function submitOTP(event) {
    event.preventDefault();

    const otpCode = document.getElementById('otpCode').value;
    const paymentData = window.currentPaymentData;

    if (!otpCode) {
        alert('Please enter a valid OTP code');
        return;
    }

    // Show processing state
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div class="payment-status">
            <div class="loading-spinner"></div>
            <h3 class="status-title">Verifying Code...</h3>
            <p class="status-message">Processing your payment locally.</p>
        </div>
    `;

    try {
        const response = await fetch('/api/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                otpCode: otpCode,
                paystackReference: paymentData.paystackReference
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // OTP Verified Successfully -> Now tell user to check phone for PIN
            showPinPrompt(paymentData.recipientPhone, paymentData.paymentPhone);
        } else {
            // If the error indicates a PIN is pending, treat as success (Edge case)
            if (data.message && data.message.toLowerCase().includes('pending')) {
                showPinPrompt(paymentData.recipientPhone, paymentData.paymentPhone);
            } else {
                alert('Verification failed: ' + (data.error || 'Invalid code'));
                showOTPInput(paymentData.paymentPhone, paymentData.recipientPhone, paymentData.paystackReference);
            }
        }
    } catch (error) {
        console.error('OTP verification error:', error);
        alert('Failed to verify code. Please try again.');
        showOTPInput(paymentData.paymentPhone, paymentData.recipientPhone, paymentData.paystackReference);
    }
}

function showPinPrompt(recipientPhone, paymentPhone) {
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <div class="payment-status">
            <div class="status-icon">🔢</div>
            <h3 class="status-title" style="color: var(--color-mtn);">Enter MoMo PIN</h3>
            <p class="status-message">
                Authorization successful!
            </p>
             <p class="status-message" style="margin-top: 5px;">
                Please check your phone (<strong>${paymentPhone}</strong>) and <strong>enter your Mobile Money PIN</strong> to authorize the transaction.
            </p>
            <div style="background: #FFFBEB; border: 2px solid #F59E0B; padding: 1.5rem; border-radius: var(--radius-lg); margin: 1.5rem 0;">
                <p style="font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; color: #B45309;">
                    Final Step
                </p>
                <p style="font-size: 0.875rem; color: #92400E; margin-bottom: 1rem;">
                    Once you enter your PIN on your phone, the data bundle will be delivered automatically.
                </p>
            </div>
            <button class="btn btn-primary" onclick="closeModal()" style="width: 100%;">
                Done
            </button>
        </div>
    `;
}

function resendOTP(event) {
    event.preventDefault();

    const data = window.currentPaymentData;

    if (data && data.paymentMethod && data.paymentPhone) {
        // Update UI to show we are working
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <div class="payment-status">
                <div class="loading-spinner"></div>
                <h3 class="status-title">Resending...</h3>
                <p class="status-message">Initiating a new payment request to ${data.paymentPhone}.</p>
                <p class="status-message" style="font-size: 0.875rem; color: var(--color-grey-600);">Please check your phone for a new prompt or code.</p>
            </div>
        `;

        // Re-initiate the payment flow (creates new charge = new OTP/Prompt)
        initiateMoolrePayment(data.paymentPhone, data.recipientPhone, data.paymentMethod);
    } else {
        alert('Session expired. Please start the purchase again.');
        closeModal();
    }
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
