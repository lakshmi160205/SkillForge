import { Schema, Types, model } from "mongoose";

const lectureSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Lecture title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    videoUrl: {
      type: String,
      default: "",
    },
    durationInSeconds: {
      type: Number,
      default: 0,
      min: [0, "Duration cannot be negative"],
    },
    order: {
      type: Number,
      required: [true, "Lecture order is required"],
      min: [1, "Lecture order must start from 1"],
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
    versionKey: false,
  },
);

const courseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    level: {
      type: String,
      enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
      default: "BEGINNER",
    },
    language: {
      type: String,
      default: "English",
      trim: true,
    },
    price: {
      type: Number,
      default: 0,
      min: [0, "Price cannot be negative"],
      set: (value) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
      },
    },
    thumbnailUrl: {
      type: String,
      default: "",
    },
    previewVideoUrl: {
      type: String,
      default: "",
    },
    instructorId: {
      type: Types.ObjectId,
      ref: "users",
      required: [true, "Instructor is required"],
    },
    lectures: {
      type: [lectureSchema],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be below 0"],
      max: [5, "Rating cannot exceed 5"],
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: [0, "Review count cannot be negative"],
    },
    totalEnrollments: {
      type: Number,
      default: 0,
      min: [0, "Enrollment count cannot be negative"],
    },
  },
  {
    timestamps: true,
    strict: "throw",
    versionKey: false,
  },
);

export const CourseModel = model("courses", courseSchema);