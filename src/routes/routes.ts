import { Router } from "express";
import emailController from "../controllers/email-controller";
import userController from "../controllers/user-controller";
import validationController from "../controllers/validation-controller";

const router = Router();

router.post("/create-account", validationController.validate, userController.createAccount, emailController.sendConfirmationEmail);

router.post("/login");

router.get("/verify/:activationCode", emailController.verifyEmailAddress);



export default router;
