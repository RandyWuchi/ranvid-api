const Joi = require("joi");
const bcrypt = require("bcrypt");
const { User } = require("../models/users");
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  // Validate the input from client
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Check if  email is valid
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email and/or password");

  // Check if password is valid
  const isValid = await bcrypt.compare(req.body.password, user.password);
  if (!isValid) return res.status(400).send("Invalid email and/or password");

  // Generate token
  const token = user.generateAuthToken();

  // Return user
  res.send(token);
});

const validate = (req) => {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  });

  return schema.validate(req);
};

module.exports = router;
