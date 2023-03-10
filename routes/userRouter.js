import { Router } from "express";
import userController from "../controllers/userController.js";
import { registerValidator, loginValidator } from "../validations.js";
import handleValidationErrors from "../utils/handleValidationErrors.js";
import checkAuth from "../utils/checkAuth.js";

const router = new Router();

router.post("/registration", registerValidator, handleValidationErrors, userController.registration);
router.post("/login", loginValidator, handleValidationErrors, userController.login);
router.get("/getMe", userController.getMe);

router.get("/all", checkAuth, userController.getAll);
router.post("/approve", checkAuth, userController.approve);
router.delete("/remove", checkAuth, userController.removeUser);

// Все результаты
router.get("/results", checkAuth, userController.allResults);

export default router;
