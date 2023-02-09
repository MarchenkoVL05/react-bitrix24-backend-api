import { Router } from "express";
import lessonController from "../controllers/lessonController.js";
import { createLessonValidator } from "../validations.js";
import handleValidationErrors from "../utils/handleValidationErrors.js";
import checkAuth from "../utils/checkAuth.js";

const router = new Router();

router.get("/", checkAuth, lessonController.getAll);
router.get("/:id", checkAuth, lessonController.getOne);
router.post("/", checkAuth, createLessonValidator, handleValidationErrors, lessonController.create);
router.delete("/", checkAuth, lessonController.remove);

export default router;
