const express = require("express");
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

/** GET /:name  =>  { location }
 *
 *  Location is { name, type, dimension, description, cost, alt_cost_curr, alt_cost_amt, neighborhood, images, reviews, agent }
 *   where images is [ image_name, ...], 
 *   reviews is [ { id, text, user_username }, ... ],
 *   and agent is { name, image }
 *
 * Authorization required: none
 */

router.get("/:name", async function (req, res, next) {
  try {
    const location = await Location.get(req.params.name);
    return res.json({ location });
  } catch (err) {
    return next(err);
  }
});

/** GET /categories/:category  =>  [ { location }, ... ]
 *
 *  Location is going to be minimal info again for the location Cards on the frontend
 *   { name, cost, alt_cost_curr, alt_cost_amt, image }
 *   If :category is 'dimensions', we'll add the dimension property to the location object and return all locations so we can 
 *   re-organize the data by dimensions on the frontend.
 *
 * Authorization required: none
 */

 router.get("/categories/:category", async function (req, res, next) {
  try {
    const locations = await Location.getAllByCategory(req.params.category.toLowerCase());
    return res.json({ locations });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;