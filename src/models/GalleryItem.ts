import * as mongoose from "mongoose";

export interface IGalleryItem extends mongoose.Document {
  title: string;
  description: string;
  imageUrl: string;
  category: "musique" | "video" | "evenement" | "rencontre";
  tags: string[];
  createdBy: mongoose.Types.ObjectId;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const galleryItemSchema = new mongoose.Schema<IGalleryItem>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 300,
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
    },
    category: {
      type: String,
      required: true,
      enum: ["musique", "video", "evenement", "rencontre"],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour les recherches
galleryItemSchema.index({ category: 1, isFeatured: 1 });
galleryItemSchema.index({ tags: 1 });

export default mongoose.model<IGalleryItem>("GalleryItem", galleryItemSchema);
