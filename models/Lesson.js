import mongoose from "mongoose";

const LessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
      unique: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Lesson", LessonSchema);
