import { Router } from "express";
import categoryController from "../controllers/categoryController.js";
import checkAuth from "../utils/checkAuth.js";
import checkRole from "../utils/checkRole.js";

const router = new Router();

router.get("/", checkAuth, categoryController.getAll);
router.post("/", checkAuth, checkRole, categoryController.create);
router.delete("/", checkAuth, checkRole, categoryController.remove);

export default router;
