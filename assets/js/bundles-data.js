// Bundle Data for All Networks
const bundlesData = {
    mtn: [
        { size: '1GB', price: 6.50, delivery: '10-15 min' },
        { size: '2GB', price: 11.50, delivery: '10-15 min' },
        { size: '3GB', price: 17, delivery: '10-15 min' },
        { size: '4GB', price: 23, delivery: '10-15 min' },
        { size: '5GB', price: 27, delivery: '10-15 min' },
        { size: '6GB', price: 32, delivery: '10-15 min' },
        { size: '7GB', price: 38, delivery: '10-15 min' },
        { size: '8GB', price: 40, delivery: '10-15 min' },
        { size: '10GB', price: 49, delivery: '10-15 min' },
        { size: '15GB', price: 70, delivery: '10-15 min' },
        { size: '20GB', price: 90, delivery: '10-15 min' },
        { size: '25GB', price: 115, delivery: '10-15 min' },
        { size: '30GB', price: 135, delivery: '10-15 min' },
        { size: '40GB', price: 180, delivery: '10-15 min' },
        { size: '50GB', price: 220, delivery: '10-15 min' },
        { size: '100GB', price: 420, delivery: '10-15 min' }
    ],
    'mtn-afa': [
        { size: '5GB', price: 28, delivery: '10-15 min' },
        { size: '10GB', price: 50, delivery: '10-15 min' },
        { size: '20GB', price: 90, delivery: '10-15 min' },
        { size: '30GB', price: 130, delivery: '10-15 min' },
        { size: '40GB', price: 180, delivery: '10-15 min' },
        { size: '50GB', price: 215, delivery: '10-15 min' }
    ],
    airteltigo: [
        { size: '1GB', price: 6, delivery: '10-15 min' },
        { size: '2GB', price: 11, delivery: '10-15 min' },
        { size: '3GB', price: 15, delivery: '10-15 min' },
        { size: '4GB', price: 20, delivery: '10-15 min' },
        { size: '5GB', price: 26, delivery: '10-15 min' },
        { size: '6GB', price: 30, delivery: '10-15 min' },
        { size: '7GB', price: 32, delivery: '10-15 min' },
        { size: '8GB', price: 40, delivery: '10-15 min' },
        { size: '10GB', price: 50, delivery: '10-15 min' },
        { size: '11GB', price: 54, delivery: '10-15 min' },
        { size: '12GB', price: 58, delivery: '10-15 min' },
        { size: '13GB', price: 62, delivery: '10-15 min' },
        { size: '14GB', price: 67, delivery: '10-15 min' },
        { size: '15GB', price: 72, delivery: '10-15 min' }
    ]
};

// Network Display Names
const networkNames = {
    'mtn': 'MTN',
    'mtn-afa': 'MTN AFA',
    'airteltigo': 'AirtelTigo'
};

// Load bundles on page load
document.addEventListener('DOMContentLoaded', function () {
    loadBundles('mtn');
    loadBundles('mtn-afa');
    loadBundles('airteltigo');
});

// Load bundles for a specific network
function loadBundles(network) {
    const container = document.getElementById(`${network}-bundles`);
    if (!container) return;

    const bundles = bundlesData[network];
    container.innerHTML = '';

    bundles.forEach(bundle => {
        const card = createBundleCard(bundle, network);
        container.appendChild(card);
    });
}

// Create bundle card element
// Create bundle list item element
function createBundleCard(bundle, network) {
    const item = document.createElement('div');
    item.className = 'bundle-item';
    item.onclick = () => purchaseBundle(network, bundle.size, bundle.price);

    item.innerHTML = `
        <div class="bundle-info">
            <span class="bundle-size">${bundle.size}</span>
            <span class="bundle-delivery-time">⚡ ${bundle.delivery}</span>
        </div>
        <div class="bundle-action">
            <span class="bundle-price">GH₵ ${bundle.price.toFixed(2)}</span>
            <div class="bundle-btn">Buy</div>
        </div>
    `;
    return item;
}
