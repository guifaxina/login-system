import { Router } from "express";
import userController from "../controllers/user-controller";

const router = Router();

router.post("/create-user", userController.createUser);
router.get("/verify/:activationCode", userController.verifyEmailAddress);

export default router;
