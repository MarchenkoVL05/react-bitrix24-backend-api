import { Router } from "express";

import categoryRouter from "./categoryRouter.js";
import lessonRouter from "./lessonRouter.js";
import userRouter from "./userRouter.js";
import questionRouter from "./questionRouter.js";
import resultRouter from "./resultRouter.js";

const router = new Router();

router.use("/category", categoryRouter);
router.use("/lesson", lessonRouter);
router.use("/question", questionRouter);
router.use("/user", userRouter);
router.use("/result", resultRouter);

export default router;
