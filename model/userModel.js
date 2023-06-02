const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      require: [true, "Enter a Username"],
      unique: [true, "That Username is taken"],
    },
    password: { type: String, require: [true, "Enter a Password"] },
    firstName: String,
    lastName: String,
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
