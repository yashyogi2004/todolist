const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connection = () => {
    mongoose.connect(process.env.MONGO_URI).then(() => {
        console.log('database connected');
    }).catch((err) => {
        console.log(err);
    })
}
module.exports = {connection};
    