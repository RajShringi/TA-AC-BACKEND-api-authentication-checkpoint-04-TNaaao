var express = require("express");
const auth = require("../middleware/auth");
var router = express.Router();
const Question = require("../models/Question");
const Answer = require("../models/Answer");
const Comment = require("../models/Comment");

router.put("/:id", auth.verifyToken, async (req, res, next) => {
  try {
    const answer = await Answer.findByIdAndUpdate(req.params.id);
    res.json({ answer });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.delete("/:id", auth.verifyToken, async (req, res, next) => {
  try {
    const answer = await Answer.findByIdAndDelete(req.params.id);
    const question = await Question.findByIdAndUpdate(answer.questionId, {
      $pull: { answers: answer.id },
    });
    const comments = await Comment.deleteMany({ answerId: answer.id });
    res.json({ answer });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.post("/:id/comments", auth.verifyToken, async (req, res, next) => {
  try {
    req.body.comment.author = req.user.userId;
    req.body.comment.answerId = req.params.id;
    console.log(req.body.comment);
    const comment = await Comment.create(req.body.comment);
    const answer = await Answer.findByIdAndUpdate(req.params.id, {
      $push: { comments: comment.id },
    });
    res.json({ comment });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.post("/:id/vote", auth.verifyToken, async (req, res, next) => {
  try {
    const answer = await Answer.findByIdAndUpdate(req.params.id, {
      $inc: { vote: 1 },
    });
    res.json({ answer });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.delete("/:id/vote", auth.verifyToken, async (req, res, next) => {
  try {
    const answer = await Answer.findByIdAndUpdate(req.params.id, {
      $inc: { vote: -1 },
    });
    res.json({ answer });
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;
