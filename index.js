import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import router from "./routes/index.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api", router);

const PORT = process.env.PORT || 4444;

mongoose.set("strictQuery", false);

mongoose
  .connect(
    "mongodb+srv://vladimir:KMeu1oBRcXHnVGnU@cluster0.4jqdqhf.mongodb.net/aksiomaCourses?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("DB is connected");
  });

app.listen(4444, (error) => {
  if (error) {
    console.log("Ошибка сервера: ", error);
  }
  console.log(`Server is running on port: ${PORT}`);
});
