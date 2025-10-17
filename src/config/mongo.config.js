const mongoose = require("mongoose");

const connectToMongoDb = () => {
    return mongoose.connect(process.env.MONGODB_CONNECT_URL).then(() => {
        console.warn("MongoDB Connection Successfully");
    }).catch((err) => {
        console.error("Mongo Connection Error:", err);
    })
}
module.exports = connectToMongoDb;