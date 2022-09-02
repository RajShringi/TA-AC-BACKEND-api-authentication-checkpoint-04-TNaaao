var express = require("express");
const auth = require("../middleware/auth");
var router = express.Router();
const Question = require("../models/Question");
const Answer = require("../models/Answer");

router.post("/", auth.verifyToken, async (req, res, next) => {
  req.body.question.author = req.user.userId;
  console.log(req.body);
  try {
    const question = await Question.create(req.body.question);
    res.json({ question });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const questions = await Question.find({});
    res.json({ questions });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put("/:id", auth.verifyToken, async (req, res, next) => {
  try {
    let question = await Question.findById(req.params.id);
    const { title, description, tags } = req.body.question;
    question.title = title ? title : question.title;
    question.description = description ? description : question.description;
    question.tags = tags ? tags : question.tags;
    question = await question.save();
    res.json({ question });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.delete("/:slug", auth.verifyToken, async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const question = await Question.findOneAndDelete({ slug });
    const answers = await Answer.deleteMany({ questionId: question.id });
    res.json({ question });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.post("/:id/answers", auth.verifyToken, async (req, res, next) => {
  try {
    req.body.answer.author = req.user.userId;
    req.body.answer.questionId = req.params.id;
    const answer = await Answer.create(req.body.answer);
    const question = await Question.findByIdAndUpdate(req.params.id, {
      $push: { answers: answer.id },
    });
    res.json({ answer });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.get("/:id/answers", auth.verifyToken, async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    const questionWithAnswers = await question.populate("answers");
    res.json({ answers: questionWithAnswers.answers });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.post("/:slug/vote", auth.verifyToken, async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const question = await Question.findOneAndUpdate(
      { slug },
      { $inc: { vote: 1 } }
    );
    res.json({ question });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

router.delete("/:slug/vote", auth.verifyToken, async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const question = await Question.findOneAndUpdate(
      { slug },
      { $inc: { vote: -1 } }
    );
    res.json({ question });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

module.exports = router;
