const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
require('dotenv').config();
const Database = require('./database');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const PREFIX = '!';

const db = new Database();

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const userId = message.author.id;

    if (command === 'daily') {
        const result = db.giveDaily(userId);
        if (!result.success) {
            return message.reply('You can only collect daily income once every 24 hours.');
        }
        return message.reply(`You collected your daily income! You now have ${result.coins} coins.`);
    }

    if (command === 'roleincome') {
        const coins = db.addCoins(userId, 50);
        return message.reply(`You collected your role income! You now have ${coins} coins.`);
    }

    if (command === 'leaderboard') {
        const leaderboard = db.getLeaderboard();
        const embed = new EmbedBuilder()
            .setTitle('Leaderboard')
            .setColor(0x00AE86)
            .setDescription(
                leaderboard.map((user, index) => `#${index + 1} <@${user.userId}> - ${user.coins} coins`).join('\n') || "No data available."
            );
        return message.channel.send({ embeds: [embed] });
    }

    if (command === 'coins') {
        const coins = db.getCoins(userId);
        return message.reply(`You have ${coins} coins.`);
    }

    if (command === 'blackjack') {
        return message.reply('Blackjack game will be implemented soon!');
    }

    if (command === 'roulette') {
        return message.reply('Roulette game will be implemented soon!');
    }
});

client.login(process.env.BOT_TOKEN);
