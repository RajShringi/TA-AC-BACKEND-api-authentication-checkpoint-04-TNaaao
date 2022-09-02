const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slugify = require("slugify");

const questionSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    slug: { type: String, required: true, unique: true },
    tags: [{ type: String }],
    vote: { type: Number, default: 0 },
    answers: [{ type: Schema.Types.ObjectId, ref: "Answer" }],
  },
  { timestamps: true }
);

questionSchema.pre("validate", function (next) {
  if (this.title && this.isModified("title")) {
    this.slug = `${slugify(this.title)}-${Date.now()}`;
  }
  console.log("YAHAPAR");
  next();
});

module.exports = mongoose.model("Question", questionSchema);
