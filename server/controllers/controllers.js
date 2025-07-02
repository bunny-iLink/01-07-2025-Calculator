// controllers/controllers.js
import { execFile } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

// __dirname replacement in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const calculateResult = async (req, res) => {
    const { expression } = req.body;

    if (!expression || typeof expression !== 'string') {
        return res.status(400).json({ error: "Invalid or missing expression" });
    }

    const cppBinaryPath = path.join(__dirname, "..", "cpp", "evaluate");

    execFile(cppBinaryPath, [expression], (error, stdout, stderr) => {
        if (error) {
            console.error("C++ Error:", stderr || error.message);
            return res.status(500).json({ error: "Failed to evaluate expression" });
        }

        res.json({ result: parseFloat(stdout) });
    });
};
