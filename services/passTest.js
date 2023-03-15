import LessonModel from "../models/Lesson.js";
import ResultModel from "../models/Result.js";
import UserModel from "../models/User.js";

export default async function passTest(req, res) {
  try {
    const lessonId = req.params.id;
    const userId = req.userInfo._id;
    const answers = req.body.answers;

    // Найди этот урок и заполни вопросы с вариантами ответов
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

    // Всего вопросов и score ученика
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

    // Если правильных ответов больше 75%, то допусти до следующего урока
    const t = (score / questionCounter) * 100;
    if (t >= 75) {
      await UserModel.findByIdAndUpdate(userId, { $inc: { lessonsAccessed: 1 } });
    }

    // Сохрани результат в бд
    const userResult = new ResultModel({
      user: userId,
      lesson: lessonId,
      score,
      questionCounter,
    });

    await userResult.save();

    // Send response only once
    if (!res.headersSent) {
      return res.json(userResult);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Внутренняя ошибка сервера",
    });
  }
}
