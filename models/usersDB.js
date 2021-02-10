const mongoose = require('mongoose');

const dbSchma = new mongoose.Schema({
    email: String,
    password: String,
    links: [String]
});

module.exports = new mongoose.model('user', dbSchma);