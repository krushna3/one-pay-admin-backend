import express from 'express'
import connectDatabase from './config/database.js'
import errorMiddleware from "./middlewares/error.js"
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import admin from "./routes/adminRoute.js"
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors'

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/api/v1", admin);

app.use(errorMiddleware);

// config for dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, 'config', 'config.env') });

//For Server Running
app.listen(process.env.PORT, () => {
    console.log(`server is working on http://localhost:${process.env.PORT}`)
})

// For Database Connection
connectDatabase();

// Handling Uncaught Exception
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`shutting down the server due to Uncaught Exception`);
    process.exit(1);
});

// Unhandeled Promise Rejection
process.on("unhandledRejection", err => {
    console.log(`Error: ${err.message}`);
    console.log(`shutting down the server due to unhandled Promise Rejection`);

    server.close(() => {
        process.exit(1);
    });
});