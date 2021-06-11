const express = require("express");

const { BadRequestError } = require("../expressErrors");

const router = new express.Router();

const Location = require("../models/location");

/** GET /  =>
 *   { locations: [ { name, cost, alt_cost_curr, alt_cost_amt, image }, ...] }
 *
 * Can filter on the query param search-term.  Whatever is passed in as the search-term, we will look to see
 * if that is included in each location's name, type, or dimension
 *
 * Authorization required: none
 */

 router.get("/", async function (req, res, next) {  
  try {
    const locations = await Location.getAll(req.query.search_term);
    return res.json({ locations });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;