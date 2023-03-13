import LessonModel from "../models/Lesson.js";
import ResultModel from "../models/Result.js";

class resultController {
  static async allResults(req, res) {
    try {
      if (req.userInfo.role == "admin") {
        const results = await ResultModel.find().populate("user", "fullName").populate("lesson");

        if (!results) {
          res.status(200).json({
            message: "Результатов ещё нет",
          });
        }

        res.status(200).json(results);
      } else {
        res.status(403).json({
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

  static async removeResult(req, res) {
    try {
      const resultId = req.body.resultId;

      if (!resultId) {
        res.status(500).json({
          message: "Не удалось удалить результат",
        });
      }

      const removedResult = await ResultModel.findByIdAndRemove(resultId);

      res.status(200).json(removedResult);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Не удалось удалить результат",
      });
    }
  }

  static async checkAnswers(req, res) {
    try {
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
      let score = 0;

      lesson.questions.forEach((question) => {
        question.options.forEach((option) => {
          if (option.right) {
            questionCounter++;
          }
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

export default resultController;
