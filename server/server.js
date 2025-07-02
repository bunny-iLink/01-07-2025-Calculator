import express from "express";
import path from "path";
import cors from "cors";
import bodyParser from "body-parser";
import db from "./database/connection.js";
import router from "./routes/router.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

const PORT = process.env.PORT || 3000;

db.getConnection()
    .then(() => {
        console.log("✅ Database connected");
    })
    .catch((err) => {
        console.error("❌ Database connection failed: ", err);
        process.exit(1);
    });

// API routes
app.use("/api", router);

app.get("/", (req, res) => {
    res.status(200).send("Connected");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

