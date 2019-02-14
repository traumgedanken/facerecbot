require("dotenv").config();

const bot = require('./modules/bot');
require('./modules/web')(bot);