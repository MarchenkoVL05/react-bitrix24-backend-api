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

    const doc = new CategoryModel({
      categoryName,
    });

    const category = await doc.save();

    res.json(category);
  }

  static async remove(req, res) {
    await CategoryModel.findByIdAndRemove(req.body.id);
    res.status(200).json({
      message: "Категория успешно удалена",
    });
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
