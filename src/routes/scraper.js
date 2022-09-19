import express from "express";
import scrape from "../utils/scraper.js";

const router = express.Router();

router.get("/", (req, res) => {
  scrape();
  res.json({
    message: "Scraper was launched!",
  });
});

export default router;
