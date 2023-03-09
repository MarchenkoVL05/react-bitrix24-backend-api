import { Router } from "express";
import resultController from "../controllers/resultController.js";

import checkAuth from "../utils/checkAuth.js";

const router = new Router();

router.post("/:id", checkAuth, resultController.checkAnswers);

export default router;
