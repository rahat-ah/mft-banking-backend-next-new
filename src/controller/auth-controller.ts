import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {Resend} from "resend";
import { Request, Response } from "express";

import { AdminModel, UserModel } from "../db/user-model";
import { sendSignupMailHtml } from "../utils/email-prototype";
import { transporter } from "../utils/nodemailer-config";

export const signUp = async (req: Request, res: Response) => {
  const { fullName, email, mobileNumber, password, role, secretCode } =
    req.body;

  if (
    !fullName ||
    !email ||
    !mobileNumber ||
    !password ||
    !role ||
    !secretCode
  ) {
    return res.json({
      success: false,
      message: "all fields are required",
    });
  }

  try {
    const isUserExist = await UserModel.findOne({ email });
    if (isUserExist) {
      return res.json({
        success: false,
        message: "user alredy exist",
      });
    }

    if (role === "admin") {
      // check if admin already exists
      const existingAdmin = await UserModel.findOne({ role: "admin" });

      if (existingAdmin) {
        return res.json({
          success: false,
          message: "Admin already exists",
        });
      }
      if (secretCode !== process.env.ADMIN_SECRET_CODE) {
        return res.json({
          success: false,
          message: "Invalid admin secret code",
        });
      }
      const hashedAdminSecretCode = await bcrypt.hash(
        process.env.ADMIN_SECRET_CODE!,
        10,
      );

      const hashedOfficeSecretCode = await bcrypt.hash(
        process.env.OFFICE_SECRET_CODE!,
        10,
      );

      await AdminModel.create({
        fullName,
        email,
        mobileNumber,
        password,
        role,
        adminSecretCode: hashedAdminSecretCode,
        officeSecretCode: hashedOfficeSecretCode,
        joinDate: new Date().toISOString(),
      });
    } else {
      const admin = await AdminModel.findOne({ role: "admin" });

      if (!admin) {
        return res.json({
          success: false,
          message: "Admin does not exist yet",
        });
      }

      const isCodeMatched = await bcrypt.compare(
        secretCode,
        admin.officeSecretCode
      );
      if (!isCodeMatched) {
        return res.json({
          success: false,
          message: "Invalid office secret code",
        });
      }

      await UserModel.create({
        fullName,
        email,
        mobileNumber,
        password,
        role,
        joinDate: new Date().toISOString(),
      });
    }


    const token = jwt.sign({ email }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.APP_ENVIRONMENT === "production",
      sameSite: process.env.APP_ENVIRONMENT === "production" ? "none" : "lax",
      maxAge: 60 * 60 * 1000,
    });


    await transporter.sendMail({
    from: `"Author of MFT" <${process.env.BREVO_EMAIL_SERVICE_SMTP_SENDER}>`,
    to: "rahatahmedbosscomputer@gmail.com",
    subject: 'Welcome to MFT!',
    html: sendSignupMailHtml(fullName)
    });
    
    res.status(200).json({
      success: true,
      message: "sign up succesfully!",
    });
    

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "server error!",
    });
  }
};
