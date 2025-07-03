// routes/router.js
import express from "express";
import { calculateResult, getHistory, deleteSingleHistory } from "../controllers/controllers.js";

const router = express.Router();

router.post("/calculate", calculateResult);

router.get("/history", getHistory);

router.delete("/delete-history/:id", deleteSingleHistory)

export default router;
