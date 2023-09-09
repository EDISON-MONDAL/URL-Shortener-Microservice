const mongoose = require('mongoose')

const urlSchema = new mongoose.Schema(
    {   
        url: { type: String, default: null },
        shortURL: { type: Number, unique: true }
    },
    /*
    {
        timestamps: true
    }
    */
)



module.exports = mongoose.model('urls', urlSchema) // url is mongodb collection name here