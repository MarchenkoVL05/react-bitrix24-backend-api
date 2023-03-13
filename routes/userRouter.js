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
// Открыть доступ ученику
router.post("/approve", checkAuth, userController.approve);
// Закрыть доступ ученику
router.post("/block", checkAuth, userController.blockAccess);
// Сделать ученика администратором платформы
router.post("/role", checkAuth, userController.makeAdmin);
// Удалить ученика
router.delete("/remove", checkAuth, userController.removeUser);

export default router;
