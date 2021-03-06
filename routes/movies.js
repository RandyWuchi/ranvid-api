const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");
const { Movie, validate } = require("../models/movies");
const { Genre } = require("../models/genres");
const moment = require("moment");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  // Get movies from the database
  const movies = await Movie.find().sort("name").select("-__v");

  // Return a list of movies
  res.send(movies);
});

router.post("/", [auth], async (req, res) => {
  // Validate input from the client
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Check if genre with given ID exists
  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send("Invalid Genre");

  // Create a new movie
  const movie = new Movie({
    title: req.body.title,
    genre: {
      _id: genre._id,
      name: genre.name,
    },
    numberInStock: req.body.numberInStock,
    dailyRentalRate: req.body.dailyRentalRate,
    publishDate: moment().toJSON(),
  });

  // Save the new to database
  await movie.save();

  // Return the movie
  res.send(movie);
});

router.get("/:id", validateObjectId, async (req, res) => {
  // Get the movie with given ID
  const movie = await Movie.findById(req.params.id).select("-__v");

  // Check if the movie with given ID exists
  if (!movie) return res.status(404).send("Movie with ID was not found");

  // Return the movie
  res.send(movie);
});

router.put("/:id", [auth], async (req, res) => {
  // Validate input from the client
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send("Invalid genre.");

  // Update the movie
  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      genre: {
        _id: genre._id,
        name: genre.name,
      },
      numberInStock: req.body.numberInStock,
      dailyRentalRate: req.body.dailyRentalRate,
    },
    { new: true }
  );

  // Check if movie exists
  if (!movie)
    return res.status(400).send("Movie with the given ID does not exist");

  // Return movie
  res.send(movie);
});

router.delete("/:id", [auth, admin], async (req, res) => {
  // Delete movie with given ID
  const movie = await Movie.findByIdAndDelete(req.params.id);

  // Check if movie exists
  if (!movie)
    return res.status(400).send("Movie with the given ID does not exist");

  // Return movie
  res.send(movie);
});

module.exports = router;
