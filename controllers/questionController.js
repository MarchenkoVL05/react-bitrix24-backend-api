import QuestionModel from '../models/Question.js';
import LessonModel from '../models/Lesson.js';
import OptionModel from '../models/Option.js';

class questionController {
  static async getAll(req, res) {
    try {
      if (req.userInfo.role == 'admin') {
        const questions = await QuestionModel.find();

        if (!questions) {
          return res.json({
            message: 'Вопросов пока нет',
          });
        }

        res.json(questions);
      } else {
        res.status(403).json({
          message: 'У вас нет доступа',
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Не удалось загрузить вопросы',
      });
    }
  }

  static async create(req, res) {
    try {
      if (req.userInfo.role == 'admin') {
        const lessonId = await LessonModel.findById(req.body.lesson);
        if (!lessonId) {
          return res.json({
            message: 'Урок указан неверно',
          });
        }

        const options = req.body.options;

        const optionDocs = options.map((option) => new OptionModel(option));
        const savedOptions = await Promise.all(
          optionDocs.map((option) => option.save())
        );

        const optionIds = savedOptions.map((option) => option._id);

        const newQuestion = new QuestionModel({
          lesson: lessonId._id,
          QuestionTitle: req.body.questionTitle,
          inputType: req.body.inputType,
          options: optionIds,
        });

        const savedQuestion = await newQuestion.save();

        const updatedLesson = await LessonModel.findByIdAndUpdate(
          lessonId,
          { $push: { questions: savedQuestion._id } },
          { new: true }
        );

        console.log(updatedLesson);

        return res.status(200).json({
          question: {
            _id: savedQuestion._id,
            lesson: savedQuestion.lesson,
            QuestionTitle: savedQuestion.QuestionTitle,
            inputType: savedQuestion.inputType,
            options: savedOptions,
          },
          message: 'Вопрос успешно создан',
        });
      } else {
        return res.status(403).json({
          message: 'Вы не можете создавать вопросы',
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Не удалось создать вопрос',
      });
    }
  }

  static async remove(req, res) {
    try {
      if (req.userInfo.role == 'admin') {
        const questionId = req.body.id;

        const question = await QuestionModel.findById(questionId);
        const optionsIds = question.options;

        await OptionModel.deleteMany({ _id: { $in: optionsIds } });
        const removedQuestion = await QuestionModel.findByIdAndRemove(
          questionId
        );

        res.status(200).json({
          removedQuestion,
          message: 'Вопрос успешно удалён',
        });
      } else {
        res.status(403).json({
          message: 'Вы не можете удалять вопросы',
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Не удалось удалить вопрос',
      });
    }
  }
}

export default questionController;
