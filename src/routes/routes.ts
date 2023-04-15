import { Router } from "express";
import userController from "../controllers/user-controller";
import validationController from "../controllers/validation-controller";

const router = Router();

router.post("/create-account", validationController.validate, userController.createAccount);

router.post("/login");

router.get("/verify/:activationCode", userController.verifyEmailAddress);



export default router;
