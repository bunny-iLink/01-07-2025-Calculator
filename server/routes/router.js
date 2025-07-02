// routes/router.js
import express from "express";
import { calculateResult } from "../controllers/controllers.js";

const router = express.Router();

router.post("/calculate", calculateResult);

export default router;
