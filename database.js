const sqlite3 = require('sqlite3').verbose();

class Database {
    constructor() {
        this.db = new sqlite3.Database('./bot_data.db', (err) => {
            if (err) console.error(err.message);
        });

        this.db.run(`CREATE TABLE IF NOT EXISTS users (
            userId TEXT PRIMARY KEY,
            coins INTEGER DEFAULT 0,
            lastDaily INTEGER DEFAULT 0
        )`);
    }

    getCoins(userId) {
        return new Promise((resolve) => {
            this.db.get('SELECT coins FROM users WHERE userId = ?', [userId], (err, row) => {
                if (err) {
                    console.error(err.message);
                    return resolve(0);
                }
                resolve(row ? row.coins : 0);
            });
        });
    }

    addCoins(userId, amount) {
        return new Promise((resolve) => {
            this.db.run('INSERT INTO users (userId, coins) VALUES (?, ?) ON CONFLICT(userId) DO UPDATE SET coins = coins + ?', 
                [userId, amount, amount], 
                (err) => {
                    if (err) console.error(err.message);
                    this.getCoins(userId).then(resolve);
                });
        });
    }

    giveDaily(userId) {
        return new Promise((resolve) => {
            this.db.get('SELECT coins, lastDaily FROM users WHERE userId = ?', [userId], (err, row) => {
                if (err) {
                    console.error(err.message);
                    return resolve({ success: false, coins: 0 });
                }

                const now = Date.now();
                if (row && now - row.lastDaily < 86400000) {
                    return resolve({ success: false, coins: row.coins });
                }

                const newCoins = (row ? row.coins : 0) + 100;
                this.db.run('INSERT INTO users (userId, coins, lastDaily) VALUES (?, ?, ?) ON CONFLICT(userId) DO UPDATE SET coins = ?, lastDaily = ?', 
                    [userId, newCoins, now, newCoins, now], 
                    (err) => {
                        if (err) console.error(err.message);
                        resolve({ success: true, coins: newCoins });
                    });
            });
        });
    }

    getLeaderboard() {
        return new Promise((resolve) => {
            this.db.all('SELECT userId, coins FROM users ORDER BY coins DESC LIMIT 10', [], (err, rows) => {
                if (err) {
                    console.error(err.message);
                    return resolve([]);
                }
                resolve(rows);
            });
        });
    }
}

module.exports = Database;
