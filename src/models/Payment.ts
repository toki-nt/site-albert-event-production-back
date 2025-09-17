import * as mongoose from "mongoose";

export interface IPayment extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentMethod: "card" | "mobile_money" | "bank_transfer";
  paymentIntentId?: string;
  clientSecret?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new mongoose.Schema<IPayment>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "EUR",
      enum: ["EUR", "USD", "MGA"],
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["card", "mobile_money", "bank_transfer"],
      required: true,
    },
    paymentIntentId: {
      type: String,
      required: false,
    },
    clientSecret: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour les recherches
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ paymentIntentId: 1 });

export default mongoose.model<IPayment>("Payment", paymentSchema);
