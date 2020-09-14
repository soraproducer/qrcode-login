const mongoose = require('mongoose')
const Schema = mongoose.Schema

const QRCodeSchema = new Schema({
    _alreadyUsed: {
        type: Boolean,
        default: false
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    url: String,
    // check scanned or not
    scanned: {
        type: Boolean,
        default: false
    },
    status: {
        type: Number,
        default: 0 // 0 -- not confirm yet; 1 -- confirm; -1 -- cancel
    },

    // get userInfo
    ticket: String,
    userInfo: {
        type: Object,
        default: {}
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    expireAt: {
        type: Date
    }
})

module.exports = mongoose.model('QRCode', QRCodeSchema)