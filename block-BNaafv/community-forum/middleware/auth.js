const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = {
  verifyToken: async (req, res, next) => {
    const token = req.headers.authorization;
    try {
      if (token) {
        const payload = await jwt.verify(token, process.env.SECRET);
        const user = await User.findById(payload.userId);
        console.log(!user.isAdmin, user.isBlock);
        if (!user.isAdmin && !user.isBlock) {
          req.user = payload;
          next();
        }
        if (user.isAdmin) {
          req.admin = payload;
          next();
        }
        if (!user.isAdmin && user.isBlock) {
          res.json({ msg: "You are blocked by admin" });
        }
      } else {
        res.status(400).json({ err: "Invalid Token" });
      }
    } catch (err) {
      next(err);
    }
  },
};
