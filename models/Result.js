import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Result", ResultSchema);
