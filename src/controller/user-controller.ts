import { Request, Response } from "express";
import {UserModel} from "../db/user-model";

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const {id} = req.params; 

    const user = await UserModel.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};