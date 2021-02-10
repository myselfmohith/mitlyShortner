const mongoose = require('mongoose');

const dbSchma = new mongoose.Schema({
    shortURL: { type:String, required:true },
    longURL: { type:String, required:true }
});

module.exports = new mongoose.model('link', dbSchma);