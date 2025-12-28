const https = require('https');
const HEADER_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyaWQiOjEwNzY0OSwiZXhwIjoxOTI1MDA5OTk5fQ.gpI1UPJGSZds9ht8Ql5ZHxKXlRrEmT4RIiAjjNmZFvU';
const USER = 'frisky252';
const ACCOUNT_NUM = '10764906059951';

const types = ['0', '1', '2', 'collection', 'payment', 'collect'];

async function testType(t) {
    return new Promise(resolve => {
        const payload = JSON.stringify({
            "type": t,
            "channel": "MTN",
            "currency": "GHS",
            "payer": "0241234567",
            "amount": 1,
            "externalref": "TEST-" + Date.now(),
            "reference": "Test Bundle",
            "accountnumber": ACCOUNT_NUM
        });

        const options = {
            hostname: 'api.moolre.com',
            path: '/open/transact/payment',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-USER': USER,
                'X-API-PUBKEY': HEADER_KEY
            }
        };

        const req = https.request(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const valid = (json.code !== undefined && String(json.message) !== "This channel does not support API topup.");
                    console.log(`[Type: ${t}] Status: ${res.statusCode} | Msg: ${json.message || json.code}`);
                } catch (e) {
                    console.log(`[Type: ${t}] Error parsing response`);
                }
                resolve();
            });
        });
        req.write(payload);
        req.end();
    });
}

(async () => {
    console.log('Testing Transaction Types...');
    for (const t of types) await testType(t);
})();
