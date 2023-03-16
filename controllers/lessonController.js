import LessonModel from "../models/Lesson.js";
import CategoryModel from "../models/Category.js";
import UserModel from "../models/User.js";
import QuestionModel from "../models/Question.js";
import OptionModel from "../models/Option.js";
import ResultModel from "../models/Result.js";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import ffmpeg from "fluent-ffmpeg";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import { path as ffprobePath } from "@ffprobe-installer/ffprobe";

import { getVideoDurationInSeconds } from "get-video-duration";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

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

      if (req.userInfo.role != "admin") {
        return res.status(403).json({
          message: "Вы не можете создавать уроки",
        });
      }

      const videoPath = req.file.path;
      const thumbnailPath = req.file.destination + "/thumbnails/";

      const videoName = req.file.filename;
      const thumbnailName = videoName.replace(/\.[^/.]+$/, "") + ".png";

      // Создём превью
      ffmpeg(videoPath)
        .on("end", () => {
          console.log("Thumbnail generated");
        })
        .screenshots({
          count: 1,
          folder: thumbnailPath,
          size: "320x240",
          filename: thumbnailName,
        });

      let videoDuration = await getVideoDurationInSeconds(videoPath);

      // Создаём урок
      const doc = new LessonModel({
        title: req.body.title,
        content: req.body.content,
        videoUrl: "/uploads/" + req.file.filename,
        thumbnail: "/uploads/thumbnails/" + req.file.filename.split(".")[0] + ".png",
        duration: Math.floor(videoDuration),
        categoryId: req.body.categoryId,
      });

      const newLesson = await doc.save();
      return res.status(200).json(newLesson);
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
        // При удалении урока => обновлять прогресс учеников
        const successedResults = [];
        const results = await ResultModel.find({ lesson: lessonId });
        for (const result of results) {
          if (result.score / result.questionCounter >= 0.75) {
            successedResults.push(result);
          }
        }

        let progressOfUsersToRemove = [];
        if (successedResults.length !== 0) {
          for (const result of successedResults) {
            const userSuccessfulResults = [];
            const currentUser = await UserModel.findById(result.user);
            const userResults = await ResultModel.find({ user: currentUser._id });

            userResults.forEach((result) => {
              if (result.score / result.questionCounter >= 0.75) {
                userSuccessfulResults.push(result);
              }
            });

            let resultsOfProgress = [];
            const currentLessonResultIndex = userSuccessfulResults.findIndex((result) => result.lesson == lessonId);
            userSuccessfulResults.slice(currentLessonResultIndex).forEach((result) => {
              resultsOfProgress.push(result);
            });

            progressOfUsersToRemove = [...progressOfUsersToRemove, resultsOfProgress];
          }
        }

        // Удали прогресс у каждого ученика кто продвинулся дальше по урокам
        if (progressOfUsersToRemove.length !== 0) {
          for (const userProgress of progressOfUsersToRemove) {
            for (const result of userProgress) {
              await ResultModel.findByIdAndDelete(result._id);
              // lessonsAccessed не должен быть меньше 1
              const user = await UserModel.findById(result.user);

              if (user.lessonsAccessed > 1) {
                await UserModel.findByIdAndUpdate(result.user, {
                  $inc: { lessonsAccessed: -1 },
                });
              }
            }
          }
        }

        // Удали все результаты за этот удаляемый урок
        await ResultModel.deleteMany({ lesson: lessonId });
        //----------------------------------------------

        const questions = await QuestionModel.find({ lesson: lessonId });

        for (const question of questions) {
          await OptionModel.deleteMany({ _id: { $in: question.options } });
        }

        await QuestionModel.deleteMany({ lesson: lessonId });

        const videoPath = path.join(__dirname, "../", lesson.videoUrl);
        if (fs.existsSync(videoPath)) {
          fs.unlinkSync(videoPath);
        }

        const thumbnail = path.join(__dirname, "../", lesson.thumbnail);
        if (fs.existsSync(thumbnail)) {
          fs.unlinkSync(thumbnail);
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
}

export default lessonController;
