import { body } from "express-validator";

export const registerValidator = [
  body("fullName", "Укажите полное имя").isLength({ min: 5 }),
  body("workPosition", "Неверная должность").isLength({ min: 5 }),
  body("password", "Пароль должен содержать минимум 5 символов").isLength({ min: 5 }),
];

export const loginValidator = [
  body("fullName", "Укажите полное имя").isLength({ min: 5 }),
  body("password", "Пароль должен содержать минимум 5 символов").isLength({ min: 5 }),
];
