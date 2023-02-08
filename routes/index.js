import { Router } from "express";

import categoryRouter from "./categoryRouter.js";
import lessonRouter from "./lessonRouter.js";
import userRouter from "./userRouter.js";

const router = new Router();

router.use("/category", categoryRouter);
router.use("/lesson", lessonRouter);
router.use("/user", userRouter);

export default router;
