const { default: mongoose } = require("mongoose");
const Schema = mongoose.Schema;

const fccUser = new Schema({
    username: {
        type: String,
        required: [true, "username is required"],
    },
    log: [{
        description: {
            type: String,
        },
        duration: {
            type: Number,
        },
        date: {
            type: Date,
        },
    }],
});

module.exports = mongoose.model("fccUser", fccUser);