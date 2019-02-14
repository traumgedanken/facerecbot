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
        await bot.sendPhoto(process.env.ADMIN_ID, fileID);
        await bot.sendMessage(process.env.ADMIN_ID, 'via @' + message.from.username);
    } catch (err) {
        await bot.sendMessage(message.chat.id, err.message);
    }
});