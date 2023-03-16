import CategoryModel from "../models/Category.js";
import LessonModel from "../models/Lesson.js";
import QuestionModel from "../models/Question.js";
import OptionModel from "../models/Option.js";
import ResultModel from "../models/Result.js";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class categoryController {
  static async getAll(req, res) {
    try {
      const categories = await CategoryModel.find();

      res.status(200).json(categories);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Не удалось загрузить категории",
      });
    }
  }

  static async create(req, res) {
    try {
      const categoryName = req.body.categoryName;

      if (req.userInfo.role == "admin") {
        const doc = new CategoryModel({
          categoryName,
        });

        const category = await doc.save();

        return res.json(category);
      } else {
        res.status(403).json({
          message: "У вас нет прав на создание категории",
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "Не удалось сохранить отдел",
      });
    }
  }

  static async remove(req, res) {
    const categoryId = req.body.id;

    try {
      if (req.userInfo.role == "admin") {
        const lessons = await LessonModel.find({ categoryId: req.body.id });

        for (const lesson of lessons) {
          const questions = await QuestionModel.find({ lesson: lesson._id });

          for (const question of questions) {
            await OptionModel.deleteMany({ _id: { $in: question.options } });
          }

          await QuestionModel.deleteMany({ lesson: lesson._id });
          await ResultModel.deleteMany({ lesson: lesson._id });

          const videoPath = path.join(__dirname, "../", lesson.videoUrl);

          if (fs.existsSync(videoPath)) {
            fs.unlinkSync(videoPath);
          }

          await LessonModel.findByIdAndRemove(lesson._id);
        }

        await CategoryModel.findByIdAndRemove(categoryId);

        return res.status(200).json({
          message: "Категория, уроки, вопросы и видео успешно удалены",
        });
      } else {
        return res.status(403).json({
          message: "У вас нет прав на удаление категории",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Не удалось удалить категорию, уроки, вопросы и видео",
      });
    }
  }
}

export default categoryController;
