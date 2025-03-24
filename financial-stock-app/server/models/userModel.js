const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true, min:6},
    watchlist: [{ type: Schema.Types.ObjectId, ref: "Stock"}],
    currency: [{type:String, default: "USD"}],
});

module.exports = mongoose.model("User", UserSchema);