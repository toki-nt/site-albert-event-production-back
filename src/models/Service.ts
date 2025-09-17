import * as mongoose from "mongoose";

export interface IService extends mongoose.Document {
  title: string;
  description: string;
  price: number;
  currency: string;
  category: "rencontre" | "artistique" | "accompagnement";
  duration?: string;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new mongoose.Schema<IService>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: 500,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    currency: {
      type: String,
      default: "EUR",
      enum: ["EUR", "USD", "MGA"],
    },
    category: {
      type: String,
      required: true,
      enum: ["rencontre", "artistique", "accompagnement"],
    },
    duration: {
      type: String,
      required: false,
    },
    features: [
      {
        type: String,
        required: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IService>("Service", serviceSchema);
