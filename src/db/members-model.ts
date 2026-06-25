import mongoose , {Schema,model,models} from "mongoose";

export interface IMember {
    _id?: mongoose.Types.ObjectId;
    firstName: string;
    lastName?: string;
    fatherFirstName: string;
    fatherLastName?: string;
    guardianFirstName?: string;
    guardianLastName?: string;
    mobileNumber?: string;
    date: Date;
    id?: string;
    villageName: string;
    fullAddress?: string;
    loanAmount: number;
    customerStatus: "new" | "old";
    paymentStatus?: "active" | "inactive";
    loanAuditor: string;
    profilePhotoUrl?: string;
    nidPhotoUrl?: string;
    stampPaperPhotoUrl?: string;
    payments?: {
      amount: number;
      paymentDate: Date;
    }[];
    dueComment?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const membersSchema = new Schema<IMember>({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    default: "",
  },
  fatherFirstName: {
    type: String,
    required: true,
  },
  fatherLastName: {
    type: String,
    default: "",
  },
  guardianFirstName: {
    type: String,
    default: "not exist",
  },
  guardianLastName: {
    type: String,
    default: "",
  },
  mobileNumber: {
    type: String,
    match: [/^01[3-9]\d{8}$/, "Invalid Bangladeshi mobile number"],
    trim: true,
    default: "not provided",
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  id:{
    type: String,
  },
  villageName: {
    type: String,
    required: true,
  },
  fullAddress: {
    type: String,
    default: "not provided",
  },
  loanAmount: {
    type: Number,
    required: true,
  },
  customerStatus: {
    type: String,
    required: true,
    enum: ["new", "old"],
  },
  paymentStatus: {
    type: String,
    default: "active",
    enum: ["active", "inactive"],
  },
  loanAuditor: {
    type: String,
    required: true,
  },
  profilePhotoUrl: {
    type: String,
    default: "",
  },
  nidPhotoUrl: {
    type: String,
    default: "",
  },
  stampPaperPhotoUrl: {
    type: String,
    default: "",
  },
  payments: {
    type: [
      {
        amount: {
          type: Number,
          default: 0,
        },
        paymentDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  dueComment:{
    type:String,
    default:""
  },
    createdAt: {
    type: Date,
    default: Date.now,
  },
    updatedAt: {
    type: Date,
    default: Date.now,
  },
}
,
{
  timestamps: true
});

export const memberModel =models?.Member || model<IMember>("Member", membersSchema);