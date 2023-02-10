import QuestionModel from "../models/Question.js";
import LessonModel from "../models/Lesson.js";
import OptionModel from "../models/Option.js";
import ResultModel from "../models/Result.js";

class questionController {
  static async getAll(req, res) {
    try {
      if (req.userInfo.role == "admin") {
        const questions = await QuestionModel.find();

        if (!questions) {
          return res.json({
            message: "Вопросов пока нет",
          });
        }

        res.json(questions);
      } else {
        res.status(500).json({
          message: "У вас нет доступа",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Не удалось загрузить вопросы",
      });
    }
  }

  static async create(req, res) {
    try {
      if (req.userInfo.role == "admin") {
        const lessonId = await LessonModel.findById(req.body.lesson);

        if (!lessonId) {
          return res.json({
            message: "Урок указан неверно",
          });
        }

        const options = req.body.options;

        const optionDocs = options.map((option) => new OptionModel(option));

        Promise.all(optionDocs.map((option) => option.save()))
          .then((savedOptions) => {
            const optionIds = savedOptions.map((option) => option._id);
            const newQuestion = new QuestionModel({
              lesson: lessonId,
              QuestionTitle: req.body.questionTitle,
              inputType: req.body.inputType,
              options: optionIds,
            });
            return newQuestion.save();
          })
          .then((savedQuestion) => {
            return LessonModel.findByIdAndUpdate(lessonId, { $push: { questions: savedQuestion._id } }, { new: true });
          })
          .then((updatedLesson) => {
            console.log(updatedLesson);
          })
          .catch((error) => {
            console.error(error);
            return res.status(500).json({
              message: "Не удалось прикрепить ответы",
            });
          });

        return res.status(200).json({
          message: "Вопрос успешно создан",
        });
      } else {
        return res.status(500).json({
          message: "Вы не можете создавать вопросы",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Не удалось создать вопрос",
      });
    }
  }

  static async remove(req, res) {
    try {
      if (req.userInfo.role == "admin") {
        const questionId = req.body.id;

        const question = await QuestionModel.findById(questionId);
        const optionsIds = question.options;

        await OptionModel.deleteMany({ _id: { $in: optionsIds } });
        await QuestionModel.findByIdAndRemove(questionId);

        res.status(200).json({
          message: "Вопрос успешно удалён",
        });
      } else {
        res.status(500).json({
          message: "Вы не можете удалять вопросы",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Не удалось удалить вопрос",
      });
    }
  }

  static async allResults(req, res) {
    try {
      if (req.userInfo.role == "admin") {
        const results = await ResultModel.find();

        if (!results) {
          res.status(200).json({
            message: "Результатов ещё нет",
          });
        }

        res.status(200).json(results);
      } else {
        res.status(500).json({
          message: "У вас нет доступа",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Не удалось загрузить результаты",
      });
    }
  }
}

export default questionController;
