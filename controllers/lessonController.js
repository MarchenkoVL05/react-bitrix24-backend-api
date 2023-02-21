import LessonModel from "../models/Lesson.js";
import CategoryModel from "../models/Category.js";
import UserModel from "../models/User.js";
import ResultModel from "../models/Result.js";
import QuestionModel from "../models/Question.js";
import OptionModel from "../models/Option.js";

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

          const currentUserCategory = await CategoryModel.findOne({ categoryName: workPosition });

          if (!currentUserCategory) {
            return res.json({
              message: "Нет уроков для Вас",
            });
          }

          const lessons = await LessonModel.find({ categoryId: currentUserCategory._id });
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
    const lessonId = req.params.id;

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

    res.status(200).json(lesson);
  }

  static async create(req, res) {
    try {
      const lessonCategory = await CategoryModel.findOne({ _id: req.body.categoryId });

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
        await LessonModel.findByIdAndRemove(lessonId);

        return res.status(200).json({
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
        message: "Не удалось сохранить резульат",
      });
    }
  }
}

export default lessonController;
