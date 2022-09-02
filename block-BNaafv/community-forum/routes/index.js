var express = require("express");
const auth = require("../middleware/auth");
const Question = require("../models/Question");
const User = require("../models/User");
var router = express.Router();

/* GET home page. */
router.get("/tags", async (req, res, next) => {
  try {
    const tags = await Question.distinct("tags");
    res.json({ tags });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

router.get("/profile/:username", async (req, res, next) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username });
    res.json({ profile: user.profileJSON() });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put("/profile/:username", auth.verifyToken, async (req, res, next) => {
  try {
    let user = await User.findOne({ username: req.params.username });
    let { username, name, image, bio, email } = req.body.profile;
    user.username = username ? username : user.username;
    user.name = name ? name : user.name;
    user.image = image ? image : user.image;
    user.bio = bio ? bio : user.bio;
    user.email = email ? email : user.email;
    user = await user.save();
    res.json({ profile: user.profileJSON() });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.post("/:username/follow", auth.verifyToken, async (req, res, next) => {
  try {
    const user = await User.findOne({ username });
    const currentUser = await User.findByIdAndUpdate(req.user.userId, {
      $addToSet: { followings: user.id },
    });
    const currentUserAfterFollowing = await User.findById(req.user.userId);
    res.json({ user: currentUserAfterFollowing });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.delete(
  "/:username/unfollow",
  auth.verifyToken,
  async (req, res, next) => {
    try {
      const user = await User.findOne({ username });
      const currentUser = await User.findByIdAndUpdate(req.user.userId, {
        $pull: { followings: user.id },
      });
      const currentUserAfterFollowing = await User.findById(req.user.userId);
      res.json({ user: currentUserAfterFollowing });
    } catch (err) {
      res.status(400).json(err);
    }
  }
);

router.post("/admin/register", async (req, res, next) => {
  try {
    req.body.admin.isAdmin = true;
    const admin = await User.create(req.body.admin);
    const token = await admin.signToken();
    res.json({ admin: admin.userJSON(token) });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.post("/admin/login", async (req, res, next) => {
  const { email, password } = req.body.admin;
  if (!email || !password) {
    return res.status(400).json({ err: "email/password required" });
  }
  try {
    const admin = await User.findOne({ email });
    if (!admin) {
      return res.status(400).json({ err: "email is not register" });
    }
    const result = await admin.verifyPassword(password);
    if (!result) {
      return res.status(400).json({ err: "Invalid password" });
    }
    const token = await admin.signToken();
    res.status(200).json({ admin: admin.userJSON(token) });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

router.get("/admin/allQuestions", auth.verifyToken, async (req, res, next) => {
  try {
    if (req.admin) {
      const questions = await Question.find({});
      res.json({ questions });
    } else {
      res.json({ msg: "you are not admin" });
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

router.get("/admin/allUsers", auth.verifyToken, async (req, res, next) => {
  try {
    if (req.admin) {
      const users = await User.find({ isAdmin: false });
      res.json({ users });
    } else {
      res.json({ msg: "you are not admin" });
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

router.post("/:username/block", auth.verifyToken, async (req, res, next) => {
  if (req.admin) {
    try {
      const username = req.params.username;
      const user = await User.findOneAndUpdate({ username }, { isBlock: true });
      console.log(await User.findOne({ username }));
      res.json({ user });
    } catch (err) {
      res.status(400).json(err);
    }
  } else {
    res.json({ msg: "You are not admin" });
  }
});

router.delete(
  "/:username/unblock",
  auth.verifyToken,
  async (req, res, next) => {
    if (req.admin) {
      try {
        const username = req.params.username;
        const user = await User.findOneAndUpdate(
          { username },
          { isBlock: false }
        );
        res.json({ user });
      } catch (err) {
        res.status(400).json(err);
      }
    } else {
      res.json({ msg: "You are not admin" });
    }
  }
);

module.exports = router;
