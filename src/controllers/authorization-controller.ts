import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "../utils/interface";
import prisma from "../utils/prismaClient";

class AuthorizationController {
  public authorize = async (req: Request, res: Response, next: NextFunction) => {
    const bearerAccessToken = req.headers["x-access-token"] as string

    if (!bearerAccessToken) return res.status(404).json({ message: "Missing token." });
    
    const accessToken = bearerAccessToken!.split(" ")[1]

    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string, async (err, decoded) => {
      if (err) {
        return res.status(500).json({ message: "Something went wrong.", err: err }
        )}
      const { userId } = decoded as JwtPayload

      const userExists = await prisma.user.findFirst({
        where: {
          id: parseInt(userId as string)
        }
      })

      userExists ? res.status(200) : res.status(404).json({ message: "User not found." });
    })

    return res.status(200)
  }
}

export default new AuthorizationController();