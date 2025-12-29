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
                <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                        <input type="radio" name="recipientType" value="self" id="recipientSelf" onchange="toggleRecipientField()" checked>
                        <span>For myself</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                        <input type="radio" name="recipientType" value="other" id="recipientOther" onchange="toggleRecipientField()">
                        <span>For someone else</span>
                    </label>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Payment Phone Number</label>
                <input type="tel" class="form-input" id="paymentNumber" placeholder="0XX XXX XXXX" required pattern="[0-9]{10}" maxlength="10" oninput="syncRecipientNumber()">
                <small style="color: var(--color-grey-600); font-size: 0.875rem;">Number that will make the payment</small>
            </div>
            
            <div class="form-group" id="recipientNumberGroup" style="display: none;">
                <label class="form-label">Recipient Phone Number</label>
                <input type="tel" class="form-input" id="recipientNumber" placeholder="0XX XXX XXXX" pattern="[0-9]{10}" maxlength="10">
                <small style="color: var(--color-grey-600); font-size: 0.875rem;">Number that will receive the data</small>
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

function toggleRecipientField() {
    const recipientType = document.querySelector('input[name="recipientType"]:checked').value;
    const recipientNumberGroup = document.getElementById('recipientNumberGroup');
    const recipientNumberInput = document.getElementById('recipientNumber');
    const paymentNumber = document.getElementById('paymentNumber').value;

    if (recipientType === 'other') {
        recipientNumberGroup.style.display = 'block';
        recipientNumberInput.required = true;
        recipientNumberInput.value = '';
    } else {
        recipientNumberGroup.style.display = 'none';
        recipientNumberInput.required = false;
        recipientNumberInput.value = paymentNumber;
    }
}

function syncRecipientNumber() {
    const recipientType = document.querySelector('input[name="recipientType"]:checked').value;
    if (recipientType === 'self') {
        const paymentNumber = document.getElementById('paymentNumber').value;
        document.getElementById('recipientNumber').value = paymentNumber;
    }
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

    const paymentNumber = document.getElementById('paymentNumber').value;
    const recipientType = document.querySelector('input[name="recipientType"]:checked').value;
    const recipientNumber = recipientType === 'self' ? paymentNumber : document.getElementById('recipientNumber').value;
    const paymentMethod = document.getElementById('paymentMethod').value;

    if (!paymentNumber || !paymentMethod) {
        alert('Please fill in all required fields');
        return;
    }

    if (recipientType === 'other' && !recipientNumber) {
        alert('Please enter the recipient phone number');
        return;
    }

    // Validate phone number format
    if (!/^0[0-9]{9}$/.test(paymentNumber)) {
        alert('Please enter a valid 10-digit payment phone number starting with 0');
        return;
    }

    if (recipientType === 'other' && !/^0[0-9]{9}$/.test(recipientNumber)) {
        alert('Please enter a valid 10-digit recipient phone number starting with 0');
        return;
    }

    // Show payment processing screen
    showPaymentProcessing(paymentNumber, recipientNumber, paymentMethod);
}

function showPaymentProcessing(paymentNumber, recipientNumber, paymentMethod) {
    const modalBody = document.getElementById('modalBody');

    const paymentMethodNames = {
        'mtn-momo': 'MTN Mobile Money',
        'telecel-cash': 'Telecel Cash',
        'airteltigo-money': 'AirtelTigo Money'
    };

    const isSameNumber = paymentNumber === recipientNumber;

    modalBody.innerHTML = `
        <div class="payment-status">
            <div class="status-icon">📱</div>
            <h3 class="status-title">Payment Request Sent</h3>
            <p class="status-message">
                A payment prompt has been sent to <strong>${paymentNumber}</strong> via ${paymentMethodNames[paymentMethod]}.
            </p>
            ${!isSameNumber ? `<p class="status-message" style="margin-top: 0.5rem;">Data will be delivered to <strong>${recipientNumber}</strong></p>` : ''}
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
    initiateMoolrePayment(paymentNumber, recipientNumber, paymentMethod);
}

async function initiateMoolrePayment(paymentPhone, recipientPhone, paymentMethod) {
    // Map dropdown values to backend codes
    const paymentMethodMap = {
        'mtn-momo': 'mtn',
        'telecel-cash': 'telecel',
        'airteltigo-money': 'airteltigo'
    };

    try {
        const response = await fetch('/api/create-payment', {
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
            // Payment initiated successfully
            console.log('Payment initiated:', data);

            // Store Reference and Details for OTP/Retry
            window.currentPaymentData = {
                paymentPhone: paymentPhone,
                recipientPhone: recipientPhone,
                paymentMethod: paymentMethod,
                paystackReference: data.transactionRef || data.paystackReference
            };

            // Check if OTP is required immediately
            if (data.requireOtp) {
                showOTPInput(paymentPhone, recipientPhone, data.transactionRef, data.message);
            } else {
                // Show processing screen - STK Push sent
                showPaymentSuccess(recipientPhone);
            }
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




function showPaymentSuccess(recipientPhone) {
    const modalBody = document.getElementById('modalBody');

    // Create container for buttons to allow dynamic switching
    modalBody.innerHTML = `
        <div class="payment-status">
            <div class="status-icon">🚀</div>
            <h3 class="status-title" style="color: var(--color-mtn);">Payment Prompt Sent!</h3>
            <p class="status-message">
                Please check your phone (<strong>${document.getElementById('paymentNumber').value}</strong>) and approve the transaction.
            </p>
            <div style="background: #FFFBEB; border: 2px solid #F59E0B; padding: 1.5rem; border-radius: var(--radius-lg); margin: 1.5rem 0;">
                <p style="font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; color: #B45309;">
                    Step 1: Approve Payment on Phone
                </p>
                <p style="font-size: 0.875rem; color: #92400E; margin-bottom: 1rem;">
                    Once you approve, we will automatically receive the confirmation and process your data.
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
                        <span style="color: var(--color-grey-600);">Amount to Pay:</span>
                        <span style="font-weight: 700; color: var(--color-mtn);">GH₵ ${currentPurchase.price.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <button class="btn btn-primary" onclick="closeModal()" style="width: 100%;">
                    I have Approved the Payment
                </button>
                <button class="btn" onclick="switchToOTPInput()" style="width: 100%; background: var(--color-grey-200); color: var(--color-grey-800);">
                    I received a code via SMS instead
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
