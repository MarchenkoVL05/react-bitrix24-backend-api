import LessonModel from "../models/Lesson.js";
import CategoryModel from "../models/Category.js";
import UserModel from "../models/User.js";
import ResultModel from "../models/Result.js";
import QuestionModel from "../models/Question.js";
import OptionModel from "../models/Option.js";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Lesson from "../models/Lesson.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class lessonController {
  static async getAll(req, res) {
    try {
      if (req.userInfo.role == "admin") {
        const lessons = await LessonModel.find();
        return res.status(200).json(lessons);
      }
      if (req.userInfo.role == "user") {
        const currentUser = await UserModel.findById(req.userInfo._id);
        if (currentUser.approved) {
          const workPosition = currentUser.workPosition;

          const currentUserCategory = await CategoryModel.findOne({
            categoryName: workPosition,
          });

          if (!currentUserCategory) {
            return res.json({
              message: "Нет уроков для Вас",
            });
          }

          const lessons = await LessonModel.find({
            categoryId: currentUserCategory._id,
          });
          return res.status(200).json(lessons);
        } else {
          res.status(403).json({
            message: req.userInfo.approved,
          });
        }
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Не удалось загрузить уроки",
      });
    }
  }

  static async getOne(req, res) {
    try {
      const lessonId = req.params.lessonId;

      const lesson = await LessonModel.findById(lessonId)
        .populate({
          path: "questions",
          populate: {
            path: "options",
          },
        })
        .populate("categoryId");

      if (!lesson) {
        return res.status(404).json({
          message: "Урок не найден",
        });
      }

      if (req.userInfo.role == "admin") {
        return res.status(200).json(lesson);
      }

      if (lesson.categoryId.categoryName == req.userInfo.workPosition) {
        return res.status(200).json(lesson);
      } else {
        return res.status(404).json({
          message: "Урок другого отдела",
        });
      }
    } catch (error) {
      return res.status(404).json({
        message: "Урок не найден",
      });
    }
  }

  static async create(req, res) {
    try {
      const lessonCategory = await CategoryModel.findOne({
        _id: req.body.categoryId,
      });

      if (!lessonCategory) {
        return res.status(404).json({
          message: "Нет такой категории",
        });
      }

      if (req.userInfo.role == "admin") {
        const doc = new LessonModel({
          title: req.body.title,
          content: req.body.content,
          videoUrl: "/uploads/" + req.file.filename,
          categoryId: req.body.categoryId,
        });

        const newLesson = await doc.save();
        return res.status(200).json(newLesson);
      } else {
        return res.status(403).json({
          message: "Вы не можете создавать уроки",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Не удалось создать урок",
      });
    }
  }

  static async remove(req, res) {
    try {
      const lessonId = req.body.lessonId;
      const lesson = await LessonModel.findById(lessonId);

      if (!lesson) {
        return res.status(404).json({
          message: "Урок не найден",
        });
      }

      if (req.userInfo.role === "admin") {
        const questions = await QuestionModel.find({ lesson: lessonId });

        for (const question of questions) {
          await OptionModel.deleteMany({ _id: { $in: question.options } });
        }

        await QuestionModel.deleteMany({ lesson: lessonId });

        const videoPath = path.join(__dirname, "../", lesson.videoUrl);
        if (fs.existsSync(videoPath)) {
          fs.unlinkSync(videoPath);
        }

        const removedLesson = await LessonModel.findByIdAndRemove(lessonId);

        return res.status(200).json({
          removedLesson,
          message: "Урок и вопросы успешно удалены",
        });
      } else {
        return res.status(403).json({
          message: "Вы не можете удалять уроки",
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Не удалось удалить урок",
      });
    }
  }

  static async searchLesson(req, res) {
    try {
      const currentUser = await UserModel.findById(req.userInfo._id);
      const workPosition = currentUser.workPosition;
      const currentUserCategory = await CategoryModel.findOne({
        categoryName: workPosition,
      });

      const regex = new RegExp(req.body.searchTitle, "i");

      if (req.userInfo.role == "user") {
        const lessons = await LessonModel.find({
          title: regex,
          categoryId: currentUserCategory._id,
        });

        if (lessons.length === 0) {
          return res.status(404).json({
            message: "Такой урок не найден",
          });
        }

        return res.json(lessons);
      }

      if (req.userInfo.role == "admin") {
        const lessons = await LessonModel.find({ title: regex });

        if (lessons.length === 0) {
          return res.status(404).json({
            message: "Такой урок не найден",
          });
        }

        return res.json(lessons);
      }
    } catch (error) {
      res.status(404).json({
        message: "Такой урок не найден",
      });
    }
  }

  static async filderLessonsByCategory(req, res) {
    try {
      const filderedCategory = req.body.categoryId;

      const lessons = await LessonModel.find({ categoryId: filderedCategory });

      if (!lessons) {
        res.status(404).json({
          message: "Уроки не найдены",
        });
      }

      res.status(200).json(lessons);
    } catch (error) {
      res.status(500).json({
        message: "Не удалось отфильтровать уроки",
      });
    }
  }

  static async checkAnswers(req, res) {
    try {
      let score = 0;

      const lessonId = req.params.id;
      const userId = req.userInfo._id;
      const answers = req.body.answers;

      const lesson = await LessonModel.findById(lessonId).populate({
        path: "questions",
        populate: {
          path: "options",
        },
      });

      if (!lesson) {
        return res.status(404).json({
          message: "Урок не найден",
        });
      }

      let questionCounter = 0;

      lesson.questions.forEach((question) => {
        questionCounter++;
        question.options.forEach((option) => {
          if (option.right && answers.includes(option._id.toString())) {
            score++;
          }
        });
      });

      const userResult = new ResultModel({
        user: userId,
        lesson: lessonId,
        score,
        questionCounter,
      });

      await userResult.save();

      res.json(userResult);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Не удалось сохранить результат",
      });
    }
  }
}

export default lessonController;
