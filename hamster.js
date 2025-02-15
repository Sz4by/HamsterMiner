const axios = require('axios');
const fs = require('fs');
const keep_alive = require('./keep_alive.js')

const csvData = fs.readFileSync('authorization.csv', 'utf8');
const authorizationList = csvData.split('\n').map(line => line.trim()).filter(line => line !== '');

async function clickWithAPI(authorization) {
    try {
        const payload = {
            count: 1,
            availableTaps: 1500,
            timestamp: Date.now()
        };

        const response = await axios.post('https://api.hamsterkombatgame.io/clicker/tap', payload, {
            headers: {
                'Authorization': `Bearer ${authorization}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            const data = response.data;
            const clickerUser = data.clickerUser;
            const requiredFields = {
                Balance: clickerUser.balanceCoins,
                Level: clickerUser.level,
                availableTaps: clickerUser.availableTaps,
                maxTaps: clickerUser.maxTaps
            };
            console.log('Đang tap:', requiredFields);
            return requiredFields;
        } else {
            console.error('Không bấm được. Status code:', response.status);
        }
    } catch (error) {
        console.error('Error:', error);
    }
    return null;
}

async function runForAuthorization(authorization) {
    while (true) {
        const clickData = await clickWithAPI(authorization);
        if (clickData && clickData.availableTaps < 10) {
            console.log(`Token ${authorization} có năng lượng nhỏ hơn 10. Chuyển token tiếp theo...`);
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 50));
    }
}

async function main() {
    while (true) {
        for (const authorization of authorizationList) {
            await runForAuthorization(authorization);
        }
        console.log('Đã chạy xong tất cả các token, nghỉ 5 giây rồi chạy lại từ đầu...');
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}

main();
