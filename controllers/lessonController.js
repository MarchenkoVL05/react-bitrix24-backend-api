import LessonModel from "../models/Lesson.js";
import CategoryModel from "../models/Category.js";
import UserModel from "../models/User.js";

class lessonController {
  static async getAll(req, res) {
    try {
      if (req.userInfo.role == "admin") {
        const lessons = await LessonModel.find();
        return res.status(200).json(lessons);
      }
      if (req.userInfo.role == "user") {
        if (req.userInfo.approved) {
          const currentUser = await UserModel.findById(req.userInfo._id);
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
          res.status(500).json({
            message: "Вас ещё не допустили к курсам",
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
      return res.status(400).json({
        message: "Урок не найден",
      });
    }

    res.status(200).json(lesson);
  }

  static async create(req, res) {
    try {
      const lessonCategory = await CategoryModel.findOne({ _id: req.body.categoryId });

      if (!lessonCategory) {
        return res.status(400).json({
          message: "Нет такой категории",
        });
      }

      if (req.userInfo.role == "admin") {
        const doc = new LessonModel({
          title: req.body.title,
          content: req.body.content,
          videoUrl: req.body.videoUrl,
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
        return res.status(400).json({
          message: "Урок не найден",
        });
      }

      if (req.userInfo.role == "admin") {
        await LessonModel.findByIdAndRemove(lessonId);

        return res.status(200).json({
          message: "Урок успешно удалён",
        });
      } else {
        return res.status(403).json({
          message: "Вы не можете удалять уроки",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Не удалось удалить урок",
      });
    }
  }
}

export default lessonController;
