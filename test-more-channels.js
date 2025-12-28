const https = require('https');
const HEADER_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyaWQiOjEwNzY0OSwiZXhwIjoxOTI1MDA5OTk5fQ.gpI1UPJGSZds9ht8Ql5ZHxKXlRrEmT4RIiAjjNmZFvU';
const USER = 'frisky252';
const ACCOUNT_NUM = '10764906059951';

// List of possible codes
const codes = [
    'mtn-gh', 'MTN-GH',
    'mobile_money', 'MOBILE_MONEY',
    'wallet', 'WALLET',
    'momo', 'MOMO',
    'ghipss', 'GHIPSS',
    'g-money', 'G-MONEY'
];

async function test(code) {
    return new Promise(resolve => {
        const payload = JSON.stringify({
            "type": "1",
            "channel": code,
            "currency": "GHS",
            "payer": "0241234567",
            "amount": 1,
            "externalref": "TEST-" + Date.now(),
            "reference": "Probe",
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
            res.on('data', c => data += c);
            res.on('end', () => {
                const isValid = !data.includes("not support API topup") && !data.includes("Request type invalid");
                console.log(`[${code}] ${res.statusCode} | ${data} | Valid? ${isValid}`);
                resolve();
            });
        });
        req.write(payload);
        req.end();
    });
}
(async () => { for (const c of codes) await test(c); })();
