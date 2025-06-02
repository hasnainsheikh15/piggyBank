import mongoose from "mongoose";
import "dotenv/config";
import connectDB from "./db/connect.db.js";
import app from "./app.js";

connectDB().then(() =>{
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    })
}).catch((error) => {
    console.error(`Failed to connect to the database: ${error.message}`);
    process.exit(1); // Exit the process with failure
})
