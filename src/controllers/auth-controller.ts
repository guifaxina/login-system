import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../utils/prismaClient";

class AuthController {
  public login = async (req: Request, res: Response) => {
    const { email, password } = req.body.data;

    try {
      const userAccount = await prisma.user.findUnique({
        where: {
          email: email,
        },
        select: {
          password: true,
          isActive: true,
        },
      });

      if (!userAccount) {
        return res.status(404).json({ message: "Account not found." });
      } else if (!userAccount!.isActive) {
        return res.status(400).json({ message: "You must activate your account in order to log in" });
      }

      const isPasswordCorrect = await bcrypt.compare(password, userAccount!.password);

      isPasswordCorrect
        ? res.status(200).json({ message: "User logged in successfully." })
        : res.status(500).json({ message: "Invalid email or password." });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "An unexpected error has occurred." });
    }
  };
}

export default new AuthController();
