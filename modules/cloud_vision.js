const vision = require('@google-cloud/vision');
const cloudinary = require('../config/cloudinary');
const File = require('./file');

const client = new vision.ImageAnnotatorClient();

module.exports = class {
    constructor() {
        this.init = async (url, username) => {
            this.file = new File(url);
            await this.file.init();
            return await cloudinary.uploadFile(this.file, `${username}/src/`, 'image');
        };

        this.getString = async () => {
            const [result] = await client.faceDetection(this.file.path);
            const faces = result.faceAnnotations;
            if (faces.length == 0) return 'Не вдалося розпізнати обличчя';

            let string = '';
            faces.forEach((face, i) => {
                string += `Лице #${i + 1}:\n`;
                string += `  Радість: ${face.joyLikelihood}\n`;
                string += `  Злість: ${face.angerLikelihood}\n`;
                string += `  Сором: ${face.sorrowLikelihood}\n`;
                string += `  Здивування: ${face.surpriseLikelihood}\n`;
            });
            return string;
        };

        this.close = async () => {
            return await this.file.delete();
        };
    }
};