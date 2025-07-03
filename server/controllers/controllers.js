import { execFile } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import db from "../database/connection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const calculateResult = async (req, res) => {
    const { expression } = req.body;

    if (!expression || typeof expression !== 'string') {
        return res.status(400).json({ error: "Invalid or missing expression" });
    }

    const cppBinaryPath = path.join(__dirname, "..", "cpp", "evaluate");

    execFile(cppBinaryPath, [expression], async (error, stdout, stderr) => {
        if (error) {
            console.error("C++ Error:", stderr || error.message);
            return res.status(500).json({ error: "Failed to evaluate expression" });
        }

        const result = parseFloat(stdout);

        try {
            // Insert into MySQL `history` table
            await db.execute(
                `INSERT INTO calculator_history (time, expression, result) VALUES (?, ?, ?)`,
                [new Date(), expression, result.toString()]
            );

            res.json({ result });
        } catch (dbError) {
            console.error("Database Insertion Error:", dbError);
            res.status(500).json({ error: "Failed to save result history" });
        }
    });
};

export const getHistory = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = 5;
        const offset = (page - 1) * limit;

        const [rows] = await db.query(
            `SELECT * FROM calculator_history ORDER BY time DESC LIMIT ${limit} OFFSET ${offset}`
        );

        const [[{ total }]] = await db.query(
            "SELECT COUNT(*) as total FROM calculator_history"
        );

        const totalPages = Math.ceil(total / limit);

        res.json({
            results: rows,
            totalResults: total,
            totalPages,
            currentPage: page,
        });
    } catch (error) {
        console.error("Database Query Error:", error);
        res.status(500).json({ error: "Failed to retrieve history" });
    }
};

export const deleteSingleHistory = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: "Invalid or missing ID" });
    }

    try {
        await db.execute(`DELETE FROM calculator_history WHERE id = ?`, [id]);
        return res.status(200).json({ message: "History entry deleted successfully" });
    } catch (error) {
        console.error("Database Deletion Error:", error);
        res.status(500).json({ error: "Failed to delete history entry" });
    }
}
