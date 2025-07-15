import express from "express";
import { explorePopularRoutes } from "../controllers/explore.controller.js";
import { ensureAuthenticated } from "../middleware/ensureAuthenticated.js";

const router = express.Router();

router.get("/repos/:language",ensureAuthenticated,explorePopularRoutes)

export default router;