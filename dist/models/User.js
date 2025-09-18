"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.default.Schema({
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
}, {
    timestamps: true,
});
// Hash password avant sauvegarde
userSchema.pre("save", async function (next) {
    const user = this;
    if (!user.isModified("password"))
        return next();
    try {
        const salt = await bcryptjs_1.default.genSalt(12);
        user.password = await bcryptjs_1.default.hash(user.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function (candidatePassword) {
    const user = this;
    return bcryptjs_1.default.compare(candidatePassword, user.password);
};
// Supprime le password du JSON output - CORRECTION
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    return userWithoutPassword;
};
exports.default = mongoose_1.default.model("User", userSchema);
