require("dotenv").config();
const TelegramBot = require('node-telegram-bot-api');
const CloudVision = require('./modules/cloud_vision');
const ParallelDots = require('./modules/parallel_dots');

const bot = new TelegramBot(process.env.BOT_TOKEN, {
    polling: true
});

bot.on('photo', async (message) => {
    console.log(message.from.username);
    try {
        await bot.sendChatAction(message.chat.id, 'typing');
        const url = await bot.getFileLink(message.photo[message.photo.length - 1].file_id);

        const cv = new CloudVision();
        await cv.init(url, message.from.username);
        let result = await cv.getString();
        await cv.close();

        const pd = new ParallelDots(url);
        result = await pd.getString();
        await bot.sendMessage(message.chat.id, result);
    } catch (err) {
        console.log(err.message);
    }
});