// connectDB.js
import mongoose from "mongoose";
import config from "config";
import dotenv from 'dotenv';

dotenv.config();

const mongodbUrl = process.env.MONGODB_URL || config.get("mongodb.url");
const dbName = process.env.DB_NAME || 'synzy-prod';

const connectDB = async () => {
    try {
        await mongoose.connect(mongodbUrl, {
            dbName: dbName
        });
        console.log(`MongoDB connected to database: ${mongoose.connection.name || dbName}`);
        ///TODO: REMOVE
        //seedDatabase();
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};

export default connectDB;
