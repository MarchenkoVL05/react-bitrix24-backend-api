import jwt from "jsonwebtoken";

export default (req, res, next) => {
  const token = (req.headers.authorization || " ").replace(/Bearer\s?/, "");

  if (token) {
    try {
      const decoded = jwt.decode(token, process.env.SECRET_KEY);
      req.role = decoded.role;
      next();
    } catch (error) {
      console.log(error);
      res.status(403).json({
        message: "У вас нет доступа",
      });
    }
  } else {
    res.status(403).json({
      message: "У вас нет доступа",
    });
  }
};
