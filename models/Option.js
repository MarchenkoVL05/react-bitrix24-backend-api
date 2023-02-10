import mongoose from "mongoose";

const OptionSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
    optionTitle: {
      type: String,
      required: true,
    },
    right: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Option", OptionSchema);
