const fetch = require('node-fetch');
const {
    URLSearchParams
} = require('url');

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
            if (!emotions || emotions.length == 0) return "No face detected";
            emotions.forEach(emotion => {
                result += `${emotion.tag}: ${Math.floor(emotion.score * 100)}%\n`;
            });
            return result;
        };
    }
};