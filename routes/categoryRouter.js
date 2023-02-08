import { Router } from "express";
import categoryController from "../controllers/categoryController.js";

const router = new Router();

router.get("/", categoryController.getAll);
router.post("/", categoryController.create);
router.delete("/", categoryController.remove);

export default router;
