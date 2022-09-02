const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String },
  image: { type: String },
  isBlock: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  followings: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

userSchema.pre("save", async function (next) {
  if (this.password && this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.verifyPassword = async function (password) {
  try {
    const result = await bcrypt.compare(password, this.password);
    return result;
  } catch (err) {
    return err;
  }
};

userSchema.methods.signToken = async function () {
  const payload = { userId: this.id, email: this.email };
  try {
    if (this.isBlock) {
      res.json({ msg: "you are blocked by user" });
      return;
    }
    const token = await jwt.sign(payload, process.env.SECRET);
    return token;
  } catch (err) {
    return err;
  }
};

userSchema.methods.userJSON = function (token) {
  return {
    username: this.username,
    email: this.email,
    token: token,
  };
};

userSchema.methods.profileJSON = function () {
  return {
    name: this.name,
    username: this.username,
    bio: this.bio,
    image: this.image,
  };
};

module.exports = mongoose.model("User", userSchema);
