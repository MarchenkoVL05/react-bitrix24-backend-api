import CategoryModel from "../models/Category.js";

class categoryController {
  static async getAll(req, res) {
    try {
      const categories = await CategoryModel.find();

      res.status(200).json(categories);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Не удалось загрузить категории",
      });
    }
  }

  static async create(req, res) {
    const categoryName = req.body.categoryName;

    if (req.userInfo.role == "admin") {
      const doc = new CategoryModel({
        categoryName,
      });

      const category = await doc.save();

      return res.json(category);
    } else {
      res.status(500).json({
        message: "У вас нет прав на создание категории",
      });
    }
  }

  static async remove(req, res) {
    if (req.userInfo.role == "admin") {
      await CategoryModel.findByIdAndRemove(req.body.id);
      return res.status(200).json({
        message: "Категория успешно удалена",
      });
    } else {
      res.status(500).json({
        message: "У вас нет прав на удаление категории",
      });
    }
    try {
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Не удалось удалить категорию",
      });
    }
  }
}

export default categoryController;
