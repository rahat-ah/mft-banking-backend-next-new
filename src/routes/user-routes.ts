import  express  from "express";
import { getUserProfile } from "../controller/user-controller";

const userRouter = express.Router();

userRouter.get("/get-user/:id", getUserProfile );

export default userRouter;

