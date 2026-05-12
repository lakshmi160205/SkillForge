import { Schema, model } from "mongoose";

const videoSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Video title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "courses",
      required: [true, "Course ID is required"],
    },
    instructorId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Instructor ID is required"],
    },
    videoUrl: {
      type: String,
      required: [true, "Video URL is required"],
    },
    cloudinaryPublicId: {
      type: String,
      default: "",
    },
    duration: {
      type: Number,
      default: 0,
      min: [0, "Duration cannot be negative"],
    },
    thumbnail: {
      type: String,
      default: "",
    },
    views: {
      type: Number,
      default: 0,
      min: [0, "Views cannot be negative"],
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const VideoModel = model("videos", videoSchema);
