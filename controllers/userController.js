import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import UserModel from "../models/User.js";
import CategoryModel from "../models/Category.js";
import ResultModel from "../models/Result.js";
import User from "../models/User.js";

class userController {
  static async registration(req, res) {
    try {
      const password = req.body.password.toString();
      const salt = await bcrypt.genSalt(7);

      const passwordHash = await bcrypt.hash(password, salt);

      const candidatWorkPosition = await CategoryModel.findOne({ categoryName: req.body.workPosition });

      if (!candidatWorkPosition) {
        return res.status(400).json({
          message: "Должность не найдена",
        });
      }

      const doc = new UserModel({
        fullName: req.body.fullName,
        password: passwordHash,
        workPosition: candidatWorkPosition.categoryName,
      });

      const user = await doc.save();

      const token = jwt.sign(
        {
          _id: user._id,
          role: user.role,
          approved: user.approved,
        },
        process.env.SECRET_KEY,
        {
          expiresIn: "24h",
        }
      );

      res.json({
        user,
        token,
      });
    } catch (error) {
      console.log(error);
      res.json({
        message: "Не удалось зарегестрироваться",
      });
    }
  }

  static async login(req, res) {
    try {
      const user = await UserModel.findOne({ fullName: req.body.fullName });

      if (!user) {
        return res.status(404).json({
          message: "Пользователь не найден",
        });
      }

      const isValidPass = await bcrypt.compare(req.body.password.toString(), user._doc.password);

      if (!isValidPass) {
        return res.status(400).json({
          message: "Неверный логин или пароль",
        });
      }

      const token = jwt.sign(
        {
          _id: user._id,
          role: user.role,
          approved: user.approved,
        },
        process.env.SECRET_KEY,
        {
          expiresIn: "24h",
        }
      );

      res.json({
        user,
        token,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Не удалось авторизоваться",
      });
    }
  }

  static async getMe(req, res) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      const userId = decoded._id;

      const user = await UserModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          message: "Пользователь не найден",
        });
      }

      res.json(user);
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Нет доступа",
      });
    }
  }

  static async getAll(req, res) {
    try {
      if (req.userInfo.role == "admin") {
        const allUsers = await UserModel.find();

        if (!allUsers) {
          return res.status(400).json({
            message: "Ученики не найдены",
          });
        }

        res.json(allUsers);
      } else {
        return res.status(403).json({
          message: "У вас нет прав",
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Не удалось загрузить учеников",
      });
    }
  }

  static async approve(req, res) {
    try {
      const userId = req.body.userId;

      if (req.userInfo.role == "admin") {
        UserModel.findOneAndUpdate(
          {
            _id: userId,
          },
          {
            approved: true,
          },
          {
            returnDocument: "after",
          },
          (error, approvedUser) => {
            if (error) {
              return res.status(500).json({
                message: "Не удалось одобрить ученика",
              });
            } else {
              const updatedUser = { ...approvedUser._doc, approved: true };
              return res.json({
                approvedUser: updatedUser,
                message: "Ученик допущен к урокам",
              });
            }
          }
        );
      } else {
        return res.status(403).json({
          message: "У вас нет прав",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Не удалось одобрить ученика",
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
}

export default userController;
