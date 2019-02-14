const vision = require('@google-cloud/vision');
const cloudinary = require('../config/cloudinary');
const File = require('./file');
const PImage = require('pureimage');
const request = require('request');
const client = new vision.ImageAnnotatorClient();

async function getJpegBuffer(img, file) {
    return new Promise(async resolve => {
        // create stream to get jpeg buffer from PImage image object
        const stream = new require('stream').Writable({
            write: function(chunk, encoding, next) {
                this.buffer = chunk;
                next();
            }
        });
        PImage.encodeJPEGToStream(img, stream).then(async () => {
            file.data = stream.buffer;
            resolve();
        });
    });
}

// add green dots at significant face places
async function updateImage(file, faces) {
    return await PImage.decodeJPEGFromStream(request.get(file.url)).then(
        async img => {
            const ctx = img.getContext('2d');
            ctx.fillStyle = '#00ff00';
            ctx.beginPath();
            faces.forEach(face => {
                face.landmarks.forEach(async landmark => {
                    ctx.arc(
                        landmark.position.x,
                        landmark.position.y,
                        4,
                        0,
                        Math.PI * 2,
                        true
                    );
                });
            });
            ctx.closePath();
            ctx.fill();
            return await getJpegBuffer(img, file);
        }
    );
}

module.exports = class {
    constructor(url, username) {
        this.url = url;
        this.username = username;
    }

    async init() {
        this.file = new File(this.url);
        await this.file.init();
        // load old image version to cloud
        this.file.url = await cloudinary.uploadFile(
            this.file,
            `${this.username}/src/`,
            'image'
        );
    }

    async rewriteImage() {
        const [result] = await client.faceDetection(this.file.url);
        const faces = result.faceAnnotations;
        if (!faces || faces.length == 0)
            throw new Error('На фото не видно лиця');
        await updateImage(this.file, faces);
        // load new image version to cloud
        return await cloudinary.uploadFile(
            this.file,
            `${this.username}/processed/`,
            'image'
        );
    }
};
