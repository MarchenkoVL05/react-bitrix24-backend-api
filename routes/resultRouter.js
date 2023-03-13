import { Router } from "express";
import resultController from "../controllers/resultController.js";

import checkAuth from "../utils/checkAuth.js";

const router = new Router();

// Получить таблицу результатов
router.get("/", checkAuth, resultController.allResults);
// Проверить ответы
router.post("/:id", checkAuth, resultController.checkAnswers);
// Удалить результат ученика
router.delete("/", checkAuth, resultController.removeResult);

export default router;
