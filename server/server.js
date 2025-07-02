const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./database/connection.js");
const router = require("./routes/router.js");
const dotenv = require("dotenv");

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

