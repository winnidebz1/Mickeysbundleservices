const https = require('https');
const KEY = '2vHRqRg3tFe1ouCmGQXfjhoDhTiDL2bW5aRp0Qk8wryTYQHnI0Er4U6kpYjxWHwS';

const paths = [
    '/v2/payments',
    '/api/v2/payments',
    '/v2/mobile-money/collection',
    '/api/payments/receive',
    '/v1/transfer', // Some APIs unify
    '/api/momo/request'
];

async function check(path) {
    return new Promise(resolve => {
        const options = {
            hostname: 'api.moolre.com',
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${KEY}`,
                'X-API-KEY': KEY
            }
        };

        const req = https.request(options, res => {
            console.log(`${path} => ${res.statusCode}`);
            resolve();
        });

        req.on('error', e => {
            console.log(`${path} => ERROR: ${e.message}`);
            resolve();
        });

        req.write(JSON.stringify({ amount: 1 }));
        req.end();
    });
}

(async () => {
    console.log('Probing Moolre V2 Endpoints...');
    for (const p of paths) await check(p);
})();
