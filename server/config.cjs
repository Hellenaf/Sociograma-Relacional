
const fs = require('fs');

const rawdata = fs.readFileSync('./config.json', 'utf-8');
const config = JSON.parse(rawdata);

module.exports = config;
