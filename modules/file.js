const path = require('path');
const download = require('download');
const date = require('date-and-time');

module.exports = class {
    // create file from url
    constructor(url) {
        this.url = url;
        this.name =
            date.format(new Date(), 'DD:MM:YYYY_HH:mm:ss') + path.extname(url);
    }

    // load info to file object
    async init() {
        this.data = await download(this.url);
    }
};
