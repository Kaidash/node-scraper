import express from "express";
import scraper from "./scraper.js";

const router = express.Router();

router.use("/scraper", scraper);

export default router;
