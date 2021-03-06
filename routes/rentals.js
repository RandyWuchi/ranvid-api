const auth = require("../middleware/auth");
const { Rental, validate } = require("../models/rentals");
const { Customer } = require("../models/customer");
const { Movie } = require("../models/movies");
const express = require("express");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  // Get rentals from the database
  const rentals = await Rental.find().sort("-dateOut").select("-__v");

  // Return rentals
  res.send(rentals);
});

router.post("/", auth, async (req, res) => {
  // Validate input from the client
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Check if customer with given ID exists
  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send("Invalid Customer");

  // Check if movie with given ID exists
  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(400).send("Invalid Movie");

  // Check if movie is in status
  if (movie.numberInStock === 0)
    return res.status(400).send("Movie is not in stock");

  // Create a new rental
  const rental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate,
    },
  });

  // Save the rental to database
  await rental.save();

  // Decrement and save movie
  movie.numberInStock--;
  movie.save();

  // Return the rental
  res.send(rental);
});

router.get("/:id", auth, async (req, res) => {
  // Get the rental with given ID
  const rental = await Rental.findById(req.params.id).select("-__v");

  // Check if the rental with given ID exists
  if (!rental) return res.status(404).send("Rental with ID was not found");

  // Return the rental
  res.send(rental);
});

module.exports = router;
