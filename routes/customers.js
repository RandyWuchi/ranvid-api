const auth = require("../middleware/auth");
const { Customer, validate } = require("../models/customer");
const express = require("express");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  // Get the customer from the database
  const customer = await Customer.find().sort("name").select("-__v");

  // Return the customer
  res.send(customer);
});

router.post("/", auth, async (req, res) => {
  // Validate input from the client
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Create a new customer
  const customer = new Customer({
    name: req.body.name,
    phone: req.body.phone,
    isGold: req.body.isGold,
  });

  // Save the customer to database
  await customer.save();
  res.send(customer);
});

router.get("/:id", auth, async (req, res) => {
  // Get customer with given ID
  const customer = await Customer.findById(req.params.id).select("-__v");

  // Check if customer with given ID exists
  if (!customer)
    return res.status(404).send("Customer with the given ID does not exist");

  // Return customer
  res.send(customer);
});

router.put("/:id", auth, async (req, res) => {
  // Validate input from the client
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Update the customer in the database
  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      phone: req.body.phone,
      isGold: req.body.isGold,
    },
    { new: true }
  );

  // Check if customer with given ID exists
  if (!customer)
    return res.status(404).send("Customer with the given ID does not exist");

  // Return customer
  res.send(customer);
});

router.delete("/:id", auth, async (req, res) => {
  // Delete customer with given ID
  const customer = await Customer.findByIdAndRemove(req.params.id);

  // Check if customer with given ID exists
  if (!customer)
    return res.status(404).send("Customer with the given ID does not exist");

  // Return customer
  res.send(customer);
});

module.exports = router;
