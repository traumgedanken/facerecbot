const fs = require('fs');
const {
    promisify
} = require('util');
fs.writeFile = promisify(fs.writeFile);
fs.unlink = promisify(fs.unlink);
const path = require('path');
const download = require('download');
const date = require('date-and-time');

module.exports = class {
    constructor(url) {
        this.url = url;
        this.name = date.format(new Date(), 'DD:MM:YYYY_HH:mm:ss') + path.extname(url);

        this.init = async () => {
            this.data = await download(this.url);
            this.path = path.join(__dirname, '../data', this.name);
            return await fs.writeFile(this.path, this.data);
        };

        this.delete = async () => {
            return await fs.unlink(this.path);
        };
    };
};