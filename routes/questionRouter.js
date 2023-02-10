import { Router } from "express";
import questionController from "../controllers/questionController.js";

import checkAuth from "../utils/checkAuth.js";

import { createQuestionValidator } from "../validations.js";
import handleValidationErrors from "../utils/handleValidationErrors.js";

const router = new Router();

router.get("/", checkAuth, questionController.getAll);
router.post("/", checkAuth, createQuestionValidator, handleValidationErrors, questionController.create);
router.delete("/", checkAuth, questionController.remove);

// Все результаты
router.get("/all", checkAuth, questionController.allResults);

export default router;
