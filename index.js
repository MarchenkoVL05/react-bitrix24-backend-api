import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";

import router from "./routes/index.js";

import checkAuth from "./utils/checkAuth.js";

dotenv.config();

const app = express();
app.use(express.json());

// Загрузка видео на сервер
app.use("/uploads", express.static("uploads"));
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("uploads");
    }
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage }).single("video");

app.post("/upload", checkAuth, (req, res) => {
  if (req.userInfo.role == "admin") {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(500).json(err);
      } else if (err) {
        return res.status(500).json(err);
      }
      return res.status(200).send(req.file);
    });
  } else {
    return res.status(400).json({
      message: "Вы не можете загружать видео",
    });
  }
});
// ///////////////////////////////////////////////////////////////////

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
