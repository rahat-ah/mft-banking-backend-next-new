import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response } from "express";

import { AdminModel, UserModel } from "../db/user-model";
import {
  sendOtpMailHtml,
  sendSignupMailHtml,
  sendSigninMailHtml,
  sendLogoutMailHtml,
} from "../utils/email-prototype";
import { transporter } from "../utils/nodemailer-config";
import { AuthRequest } from "../middlewere/userMiddlewere";

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

    let savedUser;

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

      savedUser =await AdminModel.create({
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
        admin.officeSecretCode,
      );
      if (!isCodeMatched) {
        return res.json({
          success: false,
          message: "Invalid office secret code",
        });
      }

      savedUser = await UserModel.create({
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

    res.status(200).json({
      success: true,
      message: "sign up succesfully!",
      userId: savedUser._id,
    });

    await transporter.sendMail({
      from: `"Author of MFT" <${process.env.BREVO_EMAIL_SERVICE_SMTP_SENDER}>`,
      to: "rahatahmedbosscomputer@gmail.com",
      subject: "Welcome to MFT!",
      html: sendSignupMailHtml(fullName),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "server error!",
    });
  }
};

export const sendVerifyOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  const otpExpireTime = 3 * 60 * 1000; // 3 minutes in milliseconds

  if (!email) {
    return res.json({ success: false, message: "email not given" });
  }

  try {
    const user =
      (await UserModel.findOne({ email })) ||
      (await AdminModel.findOne({ email }));

    if (!user) {
      return res.json({ success: false, message: "user not found" });
    }

    const existingOtp = user.currentOtp?.verifyOtp?.[0];

    if (existingOtp) {
      if (existingOtp.otpExpireAt > Date.now()) {
        return res.json({
          success: false,
          message: "OTP already sent. Please wait until it expires.",
        });
      }
      user.currentOtp.verifyOtp = [];
    }

    const otp = Math.floor(10000 + Math.random() * 90000);

    const otpEntry = {
      otp: otp.toString(),
      otpExpireAt: Date.now() + otpExpireTime,
    };

    // Replace old OTP with new one (not push)
    user.currentOtp.verifyOtp = [otpEntry];

    await user.save();

    await transporter
      .sendMail({
        from: `"The author of MFT" <${process.env.BREVO_EMAIL_SERVICE_SMTP_SENDER}>`,
        to: email,
        subject: "thanks from MFT||Banking",
        text: "verify with otp",
        html: sendOtpMailHtml(String(otp), "Verify Otp", 3),
      })
      .catch((err) => console.log("Otp sms send failed:", err));

    res.json({
      success: true,
      message: "send verify otp succesfully!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "server error!",
    });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { givenOtp, email } = req.body;

  if (!email || !givenOtp) {
    return res.json({ success: false, message: "missing details" });
  }

  try {
    const user =
      (await UserModel.findOne({ email })) ||
      (await AdminModel.findOne({ email }));

    if (!user) {
      return res.json({ success: false, message: "user not found" });
    }

    const otpObj = user.currentOtp?.verifyOtp?.[0];

    if (!otpObj) {
      user.currentOtp.verifyOtp = [];
      await user.save();

      return res.json({
        success: false,
        message: "OTP not found. It may have expired.",
      });
    }

    if (otpObj.otpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }

    if (otpObj.otp !== givenOtp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    user.currentOtp.verifyOtp = [];
    user.isVerified = true;

    await user.save();

    res.json({
      success: true,
      message: "OTP verified succesfully!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "server error!",
    });
  }
};

export const signin = async (req: Request, res: Response) => {
  const { email, password, mobileNumber, secretCode } = req.body;

  if (!email || !password || !mobileNumber || !secretCode) {
    return res.json({
      success: false,
      message: "all fields are required!!",
    });
  }
  try {
    // check existing token
    const existingToken = req.cookies.token as string | undefined;

    if (existingToken) {
      try {
        const decoded = jwt.verify(existingToken, process.env.JWT_SECRET!);

        return res.status(200).json({
          success: true,
          message: "Already logged in",
          user: decoded,
        });
      } catch (error) {
        // token invalid or expired
        res.clearCookie("token");
      }
    }

    const user =
      (await UserModel.findOne({ email })) ||
      (await AdminModel.findOne({ email }));

    if (!user) {
      return res.json({
        success: false,
        message: "user not found",
      });
    }
    if(!user.isVerified){
      return res.json({
        success: false,
        message: "user is not verified",
        isVerified: user.isVerified,
      });
    }
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      return res.json({
        success: false,
        message: "password is incorrect",
      });
    }
    const isMobileNumberMatched = user.mobileNumber === mobileNumber;
    if (!isMobileNumberMatched) {
      return res.json({
        success: false,
        message: "mobile number not matching",
      });
    }
    const admin = await AdminModel.findOne({ role: "admin" });
    if (!admin) {
      return res.json({
        success: false,
        message: "admin not found",
      });
    }
    let isSecretCodeValid = false;

    if (admin.officeSecretCode) {
      isSecretCodeValid = await bcrypt.compare(
        secretCode,
        admin.officeSecretCode,
      );
    }

    if (!isSecretCodeValid && admin.adminSecretCode) {
      isSecretCodeValid = await bcrypt.compare(
        secretCode,
        admin.adminSecretCode,
      );
    }

    if (!isSecretCodeValid) {
      return res.json({
        success: false,
        message: "invalid secret code",
      });
    }
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT secret not configured",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.APP_ENVIRONMENT === "production",
      sameSite: process.env.APP_ENVIRONMENT === "production" ? "none" : "lax",
      maxAge: 3 * 60 * 60 * 1000,
    });
    res.status(200).json({
      success: true,
      message: "log in succesfully!",
    });

    // then send email asynchronously
    transporter
      .sendMail({
        from: `"The author of MFT" <${process.env.BREVO_EMAIL_SERVICE_SMTP_SENDER}>`,
        to: user.email,
        subject: "welcome to MFT || Banking ✔",
        text: "You are very welcome here",
        html: sendSigninMailHtml(user.fullName),
      })
      .catch((err) => console.log("Email send failed:", err));
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "server error!",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "token not found!",
      });
    }
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT secret not configured",
      });
    }

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET,
    ) as JwtPayload;

    const user =
      (await UserModel.findById(decodedToken.id)) ||
      (await AdminModel.findById(decodedToken.id));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found!",
      });
    }

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.APP_ENVIRONMENT === "production",
      sameSite: process.env.APP_ENVIRONMENT === "production" ? "none" : "lax",
    });
    res.json({
      success: true,
      message: "log out succesfully!",
    });

    //SEND LOGOUT MAIL
    await transporter
      .sendMail({
        from: `"The author of MFT" <${process.env.BREVO_EMAIL_SERVICE_SMTP_SENDER}>`,
        to: user.email,
        subject: "thanks from MFT Banking ✔",
        text: "come again leter please",
        html: sendLogoutMailHtml(user.role + " " + user.fullName),
      })
      .catch((err) => console.log("Email send failed:", err));
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "server error!",
    });
  }
};

export const isAuth = (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  try {
    return res.json({
      success: true,
      message: "this account is authorized !",
      id: userId,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "server error!",
    });
  }
};

export const sendResetOtp = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.json({
      success: false,
      message: "email is required",
    });
  }

  try {
    const user =
      (await UserModel.findOne({ email })) ||
      (await AdminModel.findOne({ email }));

    if (!user) {
      return res.json({
        success: false,
        message: "user not found",
      });
    }

    const otp = Math.floor(10000 + Math.random() * 90000);

    const otpEntry = {
      otp: otp.toString(),
      resetOtpExpireAt: Date.now() + 3 * 60 * 1000,
    };

    // Replace old OTP with new one (not push)
    user.currentOtp.resetOtp = [otpEntry];
    await user.save();

    await transporter.sendMail({
      from: `"The author of mern auth" <${process.env.BREVO_EMAIL_SERVICE_SMTP_SENDER}>`,
      to: user.email,
      subject: "thanks from rahats mern auth ✔",
      text: "verify with otp",
      html: sendOtpMailHtml(String(otp), "Reset Otp", 3),
    });

    res.json({
      success: true,
      message: "send reset otp succesfully!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "server error!",
    });
  }
};

export const verifyResetOtp = async (req: Request, res: Response) => {
  const { email, givenOtp, newPassword } = req.body;

  if (!email || !givenOtp || !newPassword) {
    return res.json({
      success: false,
      message: "missing details",
    });
  }

  try {
    const user =
      (await UserModel.findOne({ email })) ||
      (await AdminModel.findOne({ email }));

    if (!user) {
      return res.json({
        success: false,
        message: "user not found",
      });
    }

    if (
      user.currentOtp?.resetOtp?.otp === "" ||
      user.currentOtp?.resetOtp?.otp !== givenOtp
    ) {
      return res.json({
        success: false,
        message: "invalid otp",
      });
    }

    if (user.currentOtp?.resetOtp?.resetOtpExpireAt < Date.now()) {
      return res.json({
        success: false,
        message: "otp expires , try again",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.currentOtp.resetOtp = [];
    await user.save();

    res.json({
      success: true,
      message: "verify reset otp and reset password succesfully!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "server error!",
    });
  }
};
