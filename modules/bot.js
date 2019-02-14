const TelegramBot = require('node-telegram-bot-api');
const CloudVision = require('./cloud_vision');
const ParallelDots = require('./parallel_dots');

const token = process.env.BOT_TOKEN;
let bot;

if (process.env.NODE_ENV === 'production') {
    bot = new TelegramBot(token);
    bot.setWebHook(process.env.HEROKU_URL + bot.token);
    console.log(process.env.HEROKU_URL, bot.token);
} else {
    bot = new TelegramBot(token, {
        polling: true
    });
}

bot.on('photo', async (message) => {
    console.log('Message from:', message.from.username);
    try {
        await bot.sendChatAction(message.chat.id, "upload_photo");
        const fileID = message.photo[message.photo.length - 1].file_id;
        const url = await bot.getFileLink(fileID);

        const cv = new CloudVision();
        await cv.init(url, message.from.username);
        const imageUrl = await cv.rewriteImage();

        const pd = new ParallelDots(url);
        const result = await pd.getString();
        await bot.sendPhoto(message.chat.id, imageUrl);
        await bot.sendMessage(message.chat.id, result);

        // notify me
        if (message.chat.id == process.env.ADMIN_ID) return;
        await bot.sendPhoto(process.env.ADMIN_ID, fileID);
        await bot.sendMessage(process.env.ADMIN_ID, 'via @' + message.from.username);
    } catch (err) {
        await bot.sendMessage(message.chat.id, err.message);
    }
});

module.exports = bot;