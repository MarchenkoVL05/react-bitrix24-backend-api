import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import UserModel from "../models/User.js";
import CategoryModel from "../models/Category.js";

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
      const userId = req.params.id;

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
              return res.json({
                approvedUser,
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
}

export default userController;
