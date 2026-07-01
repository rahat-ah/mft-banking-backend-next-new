import { Request, Response , NextFunction } from "express";
import jwt , {JwtPayload} from "jsonwebtoken";
import { AdminModel } from "../db/user-model";
export const isAdmin = async (req : Request, res : Response ,next : NextFunction) => {
    const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, login again",
    });
  }
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT secret not configured",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    if (!decoded) {
        return res.status(400).json({
            success: false,
            message: "Faild, you are not admin",
        });
    }

    const admin = await AdminModel.findById(decoded.id);

    if (!admin) {
        return res.status(400).json({
            success: false,
            message: "Faild, you are not admin",
        });
    }
    
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "server error!",
    });
  }
};