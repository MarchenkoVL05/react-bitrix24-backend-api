import { Router } from "express";
import userController from "../controllers/userController.js";
import { registerValidator, loginValidator } from "../validations.js";
import handleValidationErrors from "../utils/handleValidationErrors.js";
import checkAuth from "../utils/checkAuth.js";

const router = new Router();

router.post("/registration", registerValidator, handleValidationErrors, userController.registration);
router.post("/login", loginValidator, handleValidationErrors, userController.login);

router.get("/all", checkAuth, userController.getAll);
router.post("/:id", checkAuth, userController.approve);

export default router;
