import { Router } from "express";
import lessonController from "../controllers/lessonController.js";
import { createLessonValidator } from "../validations.js";
import handleValidationErrors from "../utils/handleValidationErrors.js";
import checkAuth from "../utils/checkAuth.js";
import checkRole from "../utils/checkRole.js";

const router = new Router();

router.get("/", checkAuth, lessonController.getAll);
router.get("/:id", checkAuth, lessonController.getOne);
router.post("/", checkAuth, checkRole, createLessonValidator, handleValidationErrors, lessonController.create);
router.delete("/", checkAuth, checkRole, lessonController.remove);

export default router;
