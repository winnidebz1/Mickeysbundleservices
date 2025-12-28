const https = require('https');
const HEADER_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyaWQiOjEwNzY0OSwiZXhwIjoxOTI1MDA5OTk5fQ.gpI1UPJGSZds9ht8Ql5ZHxKXlRrEmT4RIiAjjNmZFvU';
const USER = 'frisky252';
const ACCOUNT_NUM = '10764906059951';

const networks = [
    { name: 'MTN', code: 'MTN' },
    { name: 'MTN (Lowercase)', code: 'mtn' },
    { name: 'Vodafone', code: 'VODAFONE' },
    { name: 'Telecel', code: 'TELECEL' },
    { name: 'AirtelTigo', code: 'AIRTELTIGO' },
    { name: 'AT', code: 'AT' }
];

async function testNetwork(net) {
    return new Promise(resolve => {
        const payload = JSON.stringify({
            "type": "1",
            "channel": net.code,
            "currency": "GHS",
            "payer": "0241234567", // Dummy number
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
                    // If it asks for OTP (TP14) or is success, the NETWORK CODE IS VALID
                    const isValid = (json.code === 'TP14' || json.status === 'success');
                    console.log(`[${net.name} - ${net.code}] Status: ${res.statusCode} | Result: ${json.message || json.code} | Valid? ${isValid ? 'YES ✅' : 'NO ❌'}`);
                } catch (e) {
                    console.log(`[${net.name}] Error parsing: ${data.substring(0, 50)}`);
                }
                resolve();
            });
        });

        req.write(payload);
        req.end();
    });
}

(async () => {
    console.log('Testing Network Codes...');
    for (const n of networks) await testNetwork(n);
})();
