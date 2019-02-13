const fs = require('fs');
const {
    promisify
} = require('util');
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);
const path = require('path');
const download = require('download');
const date = require('date-and-time');

module.exports = class {
    // create file from url
    constructor(url) {
        this.url = url;
        this.name = date.format(new Date(), 'DD:MM:YYYY_HH:mm:ss') + path.extname(url);

        // load info to file object
        this.init = async () => {
            this.data = await download(this.url);
            this.path = path.join(__dirname, '../data', this.name);
            return await writeFile(this.path, this.data);
        };

        this.update = async () => {
            this.data = await readFile(this.path);
        };

        this.delete = async () => {
            return await unlink(this.path);
        };
    };
};