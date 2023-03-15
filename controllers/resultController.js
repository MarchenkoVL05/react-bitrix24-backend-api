import ResultModel from "../models/Result.js";

import passTest from "../services/passTest.js";

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
    // Функция сохранит первую удачную попытку и будет отдавать её на фронт
    // (+ сохранит все неудачные предыдущие)
    try {
      const lessonId = req.params.id;
      const userId = req.userInfo._id;

      // Найдём все результаты ученика за этот урок
      const userResults = await ResultModel.find({
        user: userId,
        lesson: lessonId,
      });

      // Если ученик ещё не проходил урок - сдай тест, иначе проверь старые попытки
      if (userResults.length !== 0) {
        // right - усешные попытки за этот урок
        let right = [];
        userResults.forEach((result) => {
          const t = (result.score / result.questionCounter) * 100;
          if (t >= 75) {
            right.push(result);
          } else {
            return;
          }
        });

        // Если ученик уже успешно сдал этот тест - отдай ему старый результат, иначе сдай тест
        if (right.length !== 0) {
          right.forEach((result) => {
            return res.json(result);
          });
        } else {
          passTest(req, res);
        }
      } else {
        passTest(req, res);
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Не удалось сохранить результат",
      });
    }
  }
}

export default resultController;
