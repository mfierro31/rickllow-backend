const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressErrors");

// Static methods for getting data from locations table in db

class Location {
  // Get minimal info for all locations, with optional search-term filter.  When getting all locations, each location is displayed
  // as a Card on the frontend, so we only need the info that is displayed on each Card, which is:
  // { name, cost, alt_cost_curr, alt_cost_amt, image }
  static async getAll(searchTerm) {
    let whereClause;

    if (searchTerm) {
      whereClause = `WHERE l.name ILIKE $1 
                      OR l.type ILIKE $1 
                      OR l.dimension ILIKE $1`;
    }

    const query = `SELECT l.name,
                        l.cost,
                        l.alt_cost_curr,
                        l.alt_cost_amt,
                        (SELECT name FROM location_images AS i 
                         WHERE i.location_name = l.name 
                         LIMIT 1) AS image
                 FROM locations AS l
                  LEFT JOIN location_images AS i ON i.location_name = l.name
                 ${whereClause ? whereClause : ''}
                 GROUP BY
                  l.name
                 ORDER BY
                  l.name`;

    let result;
    
    if (whereClause) {
      result = await db.query(query, [`%${searchTerm}%`]);
     
    } else {
      result = await db.query(query);
    }

    return result.rows;                     
  }

  static async get(name) {
    // Gets ALL data associated with a location: 
    // { 
    //   name, 
    //   type, 
    //   dimension, 
    //   description, 
    //   cost, 
    //   alt_cost_curr, 
    //   alt_cost_amt, 
    //   neighborhood, 
    //   images, 
    //   reviews, 
    //   agent 
    // }
    // Where images is [ image_name, ... ],
    // reviews is [ { id, text, user_username }, ... ],
    // and agent is { name, image }

    const locationResult = await db.query(`
          SELECT 
            l.name,
            l.type,
            l.dimension,
            l.description,
            l.cost,
            l.alt_cost_curr,
            l.alt_cost_amt,
            l.neighborhood,
            JSON_AGG(i.name) AS images,
            JSON_BUILD_OBJECT('name', a.name, 'image', a.image) AS agent,
            (
              SELECT 
                CASE 
                  WHEN count(reviews_by_location.text) = 0 then JSON '[]' 
                  ELSE JSON_AGG(JSON_BUILD_OBJECT('user_username', reviews_by_location.user_username, 'review', reviews_by_location.text)) 
                END AS reviews_aggregated
              FROM 
                (
                  SELECT 
                  r.text,
                  r.user_username
                  FROM reviews AS r
                    LEFT JOIN locations AS l ON l.name = r.location_name
                  WHERE l.name = $1
                ) reviews_by_location
            ) AS reviews
          FROM locations AS l
            LEFT JOIN agents AS a ON l.agent_name = a.name
            LEFT JOIN location_images AS i ON l.name = i.location_name
          WHERE l.name = $1
          GROUP BY l.name, a.name
    `, [name]);

    const location = locationResult.rows[0];

    if (!location) {
      throw new NotFoundError(`No location found with name of '${name}'`);
    }

    // const reviewsResult = await db.query(`
    //       SELECT id,
    //              text,
    //              user_username
    //       FROM reviews
    //       WHERE location_name = $1
    // `, [name]);

    // location.reviews = reviewsResult.rows;

    return location;
    // While I'm currently getting the reviews with a separate query, I know there has to be a way that I can get them in the 
    // first query.  These are the parts of the first query I took out because they were messing things up.
    // When a location had reviews, it would duplicate the images and reviews data and I can't figure out how to fix that.
    // CASE WHEN COUNT(r.id) = 0 THEN JSON '[]' ELSE
    //                JSON_AGG(JSON_BUILD_OBJECT('id', r.id, 'text', r.text, 'user_username', r.user_username)) END AS reviews,
    // LEFT JOIN reviews AS r ON l.name = r.location_name
  }

  static async getAllByCategory(category) {
    // This method gives us back same info as getAll, but takes in a different filter: category.
    // This is for some of the frontend pre-filtered routes - planets, space stations, dimensions, and misc (everything else).
    // For planets, space stations, and misc, we filter locations by their type property.  With dimensions, it's a lot more
    // complicated, so we just give back all locations without a filter and do the filtering (it's not really filtering as much
    // as re-organizing) on the frontend.
    const validCategories = ['planets', 'space-stations', 'dimensions', 'misc'];

    if (!validCategories.includes(category)) {
      throw new BadRequestError(`No such category: ${category}`);
    }

    let result;

    if (category === 'planets' || category === 'space-stations' || category === 'misc') {
      let whereClause = 'WHERE l.type ';

      if (category === 'planets') {
        whereClause += "= 'Planet'";
      }

      if (category === 'space-stations') {
        whereClause += "= 'Space Station'";
      }

      if (category === 'misc') {
        whereClause += "!= 'Planet' AND l.type != 'Space Station'"
      }

      result = await db.query(`
               SELECT l.name,
                      l.cost,
                      l.alt_cost_curr,
                      l.alt_cost_amt,
                      (SELECT name FROM location_images AS i 
                      WHERE i.location_name = l.name 
                      LIMIT 1) AS image
                  FROM locations AS l
                    LEFT JOIN location_images AS i ON i.location_name = l.name
                  ${whereClause}
                  GROUP BY
                    l.name
                  ORDER BY
                    l.name`);
    } else {
      result = await db.query(`
               SELECT l.name,
                      l.dimension,
                      l.cost,
                      l.alt_cost_curr,
                      l.alt_cost_amt,
                      (SELECT name FROM location_images AS i 
                        WHERE i.location_name = l.name 
                        LIMIT 1) AS image
              FROM locations AS l
                LEFT JOIN location_images AS i ON i.location_name = l.name
              GROUP BY
                l.name
              ORDER BY
                l.name`);
    }

    return result.rows;
  }
}

module.exports = Location;