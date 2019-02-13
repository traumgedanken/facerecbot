const vision = require('@google-cloud/vision');
const cloudinary = require('../config/cloudinary');
const File = require('./file');
const PImage = require('pureimage');
const fs = require("fs");
const client = new vision.ImageAnnotatorClient();

// add green dots at significant face places
async function updateImage(file, faces) {
    return await PImage.decodeJPEGFromStream(fs.createReadStream(file.path)).then((img) => {
        const ctx = img.getContext('2d');
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        faces.forEach((face) => {
            face.landmarks.forEach(async (landmark) => {
                ctx.arc(landmark.position.x, landmark.position.y, 4, 0, Math.PI * 2, true);
            });
        });
        ctx.closePath();
        ctx.fill();
        PImage.encodeJPEGToStream(img, fs.createWriteStream(file.path)).then(() => {
            return Promise.resolve();
        });
    });
}

module.exports = class {
    constructor() {
        this.init = async (url, username) => {
            this.file = new File(url);
            this.username = username;
            await this.file.init();
            // load old image version to cloud
            return await cloudinary.uploadFile(this.file, `${username}/src/`, 'image');
        };

        this.rewriteImage = async () => {
            const [result] = await client.faceDetection(this.file.path);
            const faces = result.faceAnnotations;
            if (!faces || faces.length == 0) {
                this.close();
                throw new Error("На фото не видно лиця");
            }
            await updateImage(this.file, faces);
            // load new image version to cloud
            await this.file.update();
            return await cloudinary.uploadFile(this.file, `${this.username}/processed/`, 'image');
        };

        this.close = async () => {
            return await this.file.delete();
        };
    }
};