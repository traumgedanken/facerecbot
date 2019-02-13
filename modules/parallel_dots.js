const fetch = require('node-fetch');
const {
    URLSearchParams
} = require('url');

const emotionsLocale = {
    Neutral: 'Нейтральність',
    Sad: 'Сум',
    Fear: 'Страх',
    Angry: 'Злість',
    Surprise: 'Здивованість',
    Happy: 'Щастя',
    Disgust: 'Відраза'
};

module.exports = class {
    constructor(url) {
        this.url = url;

        this.getString = async () => {

            const params = new URLSearchParams();
            params.append('url', this.url);
            params.append('api_key', process.env.PD_API_KEY);
            const response = await fetch('https://apis.paralleldots.com/v3/facial_emotion', {
                method: 'POST',
                body: params
            });
            let result = '';
            const emotions = (await response.json()).facial_emotion;
            if (!emotions || emotions.length == 0) return "На фото не видно лиця";
            emotions.forEach(emotion => {
                result += `${emotionsLocale[emotion.tag]}: ${Math.floor(emotion.score * 100)}%\n`;
            });
            return result;
        };
    }
};