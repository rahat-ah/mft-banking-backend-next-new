import mongoose from "mongoose";
import bcrypt from "bcrypt";

export interface IUser {
  _id?: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  role: "manager" | "loan_officer" | "ceo" | "admin";
  profileImageUrl?: string;
  branch?: string;
  joinDate: string;
  createdAt?: Date;
  updatedAt?: Date;
  department?: string;
}
export interface IAdmin extends IUser {
  adminSecretCode?: string;
  officeSecretCode?: string;
}

export const userSchema = new mongoose.Schema<IUser>({
  fullName:{
     type:String,
     required:true
  },
  email:{
    type:String,
    required:true,
    unique:true
  },
  mobileNumber:{
    type:String,
    required:true,
    trim: true,
    match: [/^01[3-9]\d{8}$/, "Invalid Bangladeshi mobile number"],
    unique:true
  },
  password:{
    type:String,
    
    required:true
  },
  role: {
    type: String,
    enum: ["manager", "loan_officer", "ceo","admin"],
    required: true,
  },
  profileImageUrl: {
    type: String,
    default: "",
  },
  branch: {
    type: String,
    default: "Bazar Bhadraghat,kamarkhondo,sirajgonj",
  },
  joinDate: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  department: {
    type: String,
    default: "Bazar Bhadraghat",
  },
},
{
  timestamps: true,
  discriminatorKey: "role",
});

userSchema.pre("save", async function () {
  if(this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

const adminSchema = new mongoose.Schema<IAdmin>({
  adminSecretCode: {
    type: String,
    default: process.env.ADMIN_SECRET_CODE,
  },
  officeSecretCode: {
    type: String,
    default: process.env.OFFICE_SECRET_CODE,
  },
  

})

export const UserModel =mongoose.models?.User || mongoose.model<IUser>("User", userSchema);
export const AdminModel = UserModel.discriminator(
  "admin",
  adminSchema
);


