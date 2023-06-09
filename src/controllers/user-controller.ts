import { Request, Response, NextFunction } from "express";
import { IUser, JwtPayload } from "../utils/interface";
import bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";
import prisma from "../utils/prismaClient";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

class UserController {
  public createAccount = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    try {
      const user: IUser = req.body.data;

      user.password = await this.hashPassword(user.password);

      user.activationCode = randomBytes(128).toString("base64url");

      const userCreated = await prisma.user.create({
        data: user,
        select: {
          email: true,
          name: true,
          createdAt: true,
        },
      });

      if (userCreated) {
        next();
        return res.status(200).json({
          message:
            "Account created successfully, please verify your email address.",
        });
      }

      return res.status(500).json({ message: "Failed to create user." });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Something went wrong." });
    }
  };

  private hashPassword = async (password: string): Promise<string> => {
    try {
      return await bcrypt.hash(password, 12);
    } catch (err) {
      console.log(err);
      throw new Error("Failed to encrypt password.");
    }
  };

  public resetPassword = async (req: Request, res: Response) => {
    try {
      const { recoverCode } = req.params;

      let { password } = req.body;

      password = await bcrypt.hash(password, 12);

      jwt.verify(
        recoverCode,
        process.env.RECOVER_PASSWORD_SECRET as string,
        async (err, decoded) => {
          if (err)
            return res.status(500).json({ message: "Something went wrong.", error: err });

          const { email } = decoded as JwtPayload;

          await prisma.user.update({
            where: {
              email: email,
            },
            data: {
              password: {
                set: password,
              },
            },
          });
        }
      );
      return res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Something went wrong." });
    }
  };
}

export default new UserController();
