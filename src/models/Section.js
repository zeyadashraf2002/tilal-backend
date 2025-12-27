// backend/src/models/Section.js
import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
  {
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    area: {
      type: Number,
      default: 0,
    },
    referenceImages: [
      {
        url: String,
        cloudinaryId: String,
        caption: String,
        mediaType: {
          type: String,
          enum: ["image", "video"],
          default: "image",
        },
        format: String,
        duration: Number,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        qtn: {
          type: Number,
          default: 1,
        },
        description: String,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "maintenance"],
      default: "pending",
    },
    lastWorkedOn: Date,
    notes: String,
    lastTaskStatus: {
      type: String,
      enum: [
        "pending",
        "assigned",
        "in-progress",
        "completed",
        "review",
        "rejected",
      ],
    },
    lastTaskDate: Date,
    lastTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
sectionSchema.index({ site: 1, name: 1 });

const Section = mongoose.model("Section", sectionSchema);

export default Section;
