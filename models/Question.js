import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
  {
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    QuestionTitle: {
      type: String,
      required: true,
    },
    inputType: {
      type: String,
      required: true,
    },
    options: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Option",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Question", QuestionSchema);
