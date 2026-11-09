require("dotenv").config();
const mongoose = require('mongoose');

async function connectDB() {
    try{
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("Connected to Database successfully!");
    }catch(error){
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
}

module.exports = connectDB;