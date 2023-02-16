import { Router } from "express";
import categoryController from "../controllers/categoryController.js";
import checkAuth from "../utils/checkAuth.js";

const router = new Router();

router.get("/", categoryController.getAll);
router.post("/", checkAuth, categoryController.create);
router.delete("/", checkAuth, categoryController.remove);

export default router;
