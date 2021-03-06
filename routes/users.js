const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User, validate } = require("../models/users");
const express = require("express");
const router = express.Router();

router.get("/me", auth, async (req, res) => {
  // Get current user
  const user = await User.findById(req.user._id).select("-password");

  // Return user
  res.send(user);
});

router.post("/", async (req, res) => {
  // Validate the input from client
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Check if user with email already exists
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User with email already exists");

  // Create a new User
  user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  // Save user to database
  await user.save();

  // Generate token
  const token = user.generateAuthToken();

  // Return user
  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(_.pick(user, ["_id", "name", "email"]));
});

module.exports = router;
