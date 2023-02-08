import jwt from "jsonwebtoken";

export default (req, res, next) => {
  const token = (req.headers.authorization || " ").replace(/Bearer\s?/, "");

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      req.userInfo = decoded;
      next();
    } catch (error) {
      console.log(error);
      return res.status(403).json({
        message: "У вас нет доступа",
      });
    }
  } else {
    return res.status(403).json({
      message: "У вас нет доступа",
    });
  }
};
