import * as mongoose from "mongoose";
import * as bcrypt from "bcryptjs";

export interface IUser extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userType: "malagasy" | "foreigner";
  profileCompleted: boolean;
  dateOfBirth?: Date;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    country?: string;
    zipCode?: string;
  };
  bio?: string;
  profilePicture?: string;
  preferences?: {
    notifications: boolean;
    language: string;
  };
  verificationStatus?: "pending" | "verified" | "rejected";
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    userType: {
      type: String,
      enum: ["malagasy", "foreigner"],
      required: true,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    dateOfBirth: {
      type: Date,
      required: false,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
    },
    address: {
      street: { type: String, required: false },
      city: { type: String, required: false },
      country: { type: String, required: false },
      zipCode: { type: String, required: false },
    },
    bio: {
      type: String,
      maxlength: 500,
      required: false,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    preferences: {
      notifications: {
        type: Boolean,
        default: true,
      },
      language: {
        type: String,
        default: "fr",
      },
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password avant sauvegarde
userSchema.pre("save", async function (next) {
  const user = this as IUser;

  if (!user.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const user = this as IUser;
  return bcrypt.compare(candidatePassword, user.password);
};

// Supprime le password du JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject() as IUser;
  delete user.password;
  return user;
};

export default mongoose.model<IUser>("User", userSchema);
