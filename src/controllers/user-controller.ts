import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { IUser } from "../interface";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

class UserController {
  public createUser = async (req: Request, res: Response): Promise<Response> => {
    const user: IUser = req.body.data;

    if (!this.validatePassword(user.password)) {
      return res.status(400).json({ message: "Invalid password." });
    }

    const hashedPassword = await this.hashPassword(user.password);
    user.password = hashedPassword;

    try {
      const response = await prisma.user.create({ 
        data: user, 
        select: { 
          email: true,
          name: true,
          createdAt: true
      } });
      return res.status(201).json({ message: "User created successfully.", data: response });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Something went wrong." });
    }
  }

  private hashPassword = async (password: string): Promise<string> => {
    try {
      return await bcrypt.hash(password, 12);
    } catch (err) {
      console.log(err);
      throw new Error("Failed to encrypt password.");
    }
  }

  private validatePassword = (password: string): Boolean | Error => {
    const passwordRegex = /^(?=.*?[A-Z])(?=.*?[^\w\s])(?=.*?\d)(.{8,})$/;
    
    try {
      return passwordRegex.test(password)
    } catch (err) {
      console.error(err);
      throw new Error("Failed to validate password.")
    }
  }
}

export default new UserController();
