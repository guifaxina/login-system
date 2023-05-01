import { User } from "@prisma/client";
import { createTransport } from "nodemailer";
import { Request, Response } from "express";
import prisma from "../utils/prismaClient"
import jwt from "jsonwebtoken";

class EmailController {
  public sendConfirmationEmail = async (req: Request, _: Response): Promise<void | Error> => {
    try {
      const user: User = req.body.data
      
      const userActivationCode = await prisma.user.findUnique({
        where: {
          email: user.email
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
  
      await transporter.sendMail({
        from: '"Guilherme Faxina" <gui.sfax@gmail.com>',
        to: user.email,
        subject: "Confirm Your Email Address",
        text: `
        Dear ${user.name},

        Thank you for signing up for our service. 
        To complete your registration, we need to confirm your email address.
        
        Please click on the following link to verify your email address:
        
        http://localhost:3000/api/v1/verify/${userActivationCode.activationCode}
        
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

  public verifyEmailAddress = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { activationCode } = req.params;
      
      const user: User | null = await prisma.user.findFirst({
        where: {
          activationCode: activationCode
        }
      });

      if (user) {
        await prisma.user.update({
          where: { 
            id: user.id
          },
          data: { 
            isActive: true, 
            activationCode: null
          }
        })
        return res.status(200).json({ message: "Email address verified." });
      } 

      return res.status(400).json({ message: "Invalid activation code." });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Something went wrong." });
    }
  }

  public sendRecoverPasswordEmail = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email } = req.body.data;

      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
        select: {
          name: true,
        },
      });

      if (user) {
        const transporter = createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
          },
        });

        const recoverCode = jwt.sign(
          { email: email },
          process.env.RECOVER_PASSWORD_SECRET as string,
          { expiresIn: "15 minutes" } // Fifteen minutes
        );

        transporter.sendMail({
          from: '"Guilherme Faxina" <faxina@contact.com>',
          to: email,
          subject: "Password Reset Request",
          text: `
        Dear ${user.name},

        We received a request to reset your password for your account. 
        
        To reset your password, please click on the following link or copy and paste it into your browser:

        http://localhost:3000/api/v1/recover-password/${recoverCode}

        Please note that this link will expire in 15 minutes. If you do not reset your password within this time period, you will need to submit another request.
        
        If you did not request this change, please disregard this email.`,
        });
      }
      return res.status(200).json({ message: "Password reset email sent." });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Something went wrong." });
    }
  };
}

export default new EmailController();