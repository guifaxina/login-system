import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { IUser } from "../interface";
import bcrypt from "bcrypt";
import { randomBytes } from "node:crypto"
import { createTransport } from "nodemailer";

const prisma = new PrismaClient();

class UserController {
  public createUser = async (req: Request, res: Response): Promise<Response> => {
    try {
    const user: IUser = req.body.data;

    if (!this.validateCredentials(user.email, user.password)) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const hashedPassword = await this.hashPassword(user.password);
    user.password = hashedPassword;

    user.activationCode = randomBytes(128).toString("base64url");
    
    const response = await prisma.user.create({ 
      data: user, 
      select: { 
        email: true,
        name: true,
        createdAt: true
      } 
    });

    this.sendConfirmationEmail(user.email, user.name);
      
    return res.status(201).json({ message: "User created successfully.", data: response });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to create user." }); 
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

  private validateEmail = (email: string): Boolean | Error => {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;

    try {
      return emailRegex.test(email);
    } catch (err) {
      throw new Error("Failed to validate email address.");
    }
  }

  private validateCredentials = (email: string, password: string): Boolean | Error => {
    return this.validateEmail(email) && this.validatePassword(password)
  }

  private sendConfirmationEmail = async (email: string, receiverName: string): Promise<void | Error> => {
    try {
      const userActivationCode = await prisma.user.findUnique({
        where: {
          email: email
        },
        select: {
          activationCode: true
        }
      })

      if (!userActivationCode?.activationCode) {
        throw new Error("User does not have activation code.");
      }

      const transporter = createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS
        }
      })
  
      transporter.sendMail({
        from: '"Guilherme Faxina" <gui.sfax@gmail.com>',
        to: email,
        subject: "Confirm Your Email Address",
        text: `
        Dear ${receiverName},

        Thank you for signing up for our service. 
        To complete your registration, we need to confirm your email address.
        
        Please click on the following link to verify your email address:
        
        ${userActivationCode?.activationCode}
        
        If you did not register for our service or did not request to verify your email address, please disregard this email.
        
        Thank you for your time and we look forward to serving you.
        
        Best regards,
        Guilherme Faxina Team.`,
      })
  
    } catch (err) {
      console.error(err);
      throw new Error("Failed to send confirmation email.")
    }
  }
}


export default new UserController();
