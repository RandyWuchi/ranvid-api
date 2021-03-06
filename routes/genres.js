const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { Genre, validate } = require("../models/genres");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  // Get the genre from the database
  const genres = await Genre.find().sort("name");

  // Return the genre
  res.send(genres);
});

router.post("/", auth, async (req, res) => {
  // Validate the input from client
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Create a new Customer
  const genre = new Genre({ name: req.body.name });

  // Add genre to database
  await genre.save();
  res.send(genre);
});

router.get("/:id", validateObjectId, async (req, res) => {
  // Get genre with the given ID
  const genre = await Genre.findById().select("-__v");

  // Check if genre with given ID exists
  if (!genre)
    return res.status(404).send("Genre with the given ID does not exist");

  // Return the genre
  res.send(genre);
});

router.put("/:id", [auth, validateObjectId], async (req, res) => {
  // Validate input from client
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Update the genre with given ID in backend
  const genre = await Genre.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true }
  );

  // Check if genre with given ID exists
  if (!genre)
    return res.status(404).send("Genre with the given ID does not exist");

  // Return the Genre
  res.send(genre);
});

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  // Delete the genre with the given ID
  const genre = await Genre.findByIdAndRemove(req.params.id);

  // Check if genre with given ID exists
  if (!genre)
    return res.status(404).send("Genre with the given ID does not exist");

  // Return the genre
  res.send(genre);
});

module.exports = router;
