const https = require('https');

const data = JSON.stringify({
    account_number: '0241234567',
    amount: 1,
    network: 'MTN',
    reference: 'TEST-' + Date.now(),
    description: 'Test Payment'
});

const options = {
    hostname: 'api.moolre.com',
    path: '/v1/payments/collection',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 2vHRqRg3tFe1ouCmGQXfjhoDhTiDL2bW5aRp0Qk8wryTYQHnI0Er4U6kpYjxWHwS',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);

    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.write(data);
req.end();
