import { Router } from "express";
import lessonController from "../controllers/lessonController.js";
import { createLessonValidator } from "../validations.js";
import handleValidationErrors from "../utils/handleValidationErrors.js";
import checkAuth from "../utils/checkAuth.js";

import { upload } from "../storage.js";

const router = new Router();

router.get("/", checkAuth, lessonController.getAll);
router.get("/:lessonId", checkAuth, lessonController.getOne);
// Поиск уроков
router.post("/search", checkAuth, lessonController.searchLesson);
// Фильтр уроков
router.post("/filter", checkAuth, lessonController.filderLessonsByCategory);

router.post(
  "/",
  checkAuth,
  upload.single("video"),
  createLessonValidator,
  handleValidationErrors,
  lessonController.create
);
router.delete("/", checkAuth, lessonController.remove);

export default router;
