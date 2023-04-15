import { NextFunction, Request, Response } from "express";
import { IUser } from "../utils/interface";

class ValidationController {
  public validate = async (req: Request, res: Response, next: NextFunction) => {
    const user: IUser = req.body.data;

    if (!this.validateCredentials(user.email, user.password)) {
      return res.status(400).json({ message: "Invalid email or password." });
    } 

    next();
  }
  private validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*?[A-Z])(?=.*?[^\w\s])(?=.*?\d)(.{8,})$/;
    
    return passwordRegex.test(password);
  }

  private validateEmail = (email: string): boolean => {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;

    return emailRegex.test(email);
  }

  private validateCredentials = (email: string, password: string): boolean => {
    return this.validateEmail(email) && this.validatePassword(password)
  }
}

export default new ValidationController();