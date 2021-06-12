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
    const result = await db.query(`
          SELECT l.name,
                 l.type,
                 l.dimension,
                 l.description,
                 l.cost,
                 l.alt_cost_curr,
                 l.alt_cost_amt,
                 l.neighborhood,
                 JSON_AGG(i.name) AS images,
                 CASE WHEN COUNT(r.id) = 0 THEN JSON '[]' ELSE
                   JSON_AGG(JSON_BUILD_OBJECT('id', r.id, 'text', r.text, 'user_username', r.user_username)) END AS reviews,
                 JSON_BUILD_OBJECT('name', a.name, 'image', a.image) AS agent
          FROM locations AS l
            LEFT JOIN agents AS a ON l.agent_name = a.name
            LEFT JOIN location_images AS i ON l.name = i.location_name
            LEFT JOIN reviews AS r ON l.name = r.location_name
          WHERE l.name = $1
          GROUP BY l.name, a.name
    `, [name]);

    const location = result.rows[0];

    if (!location) {
      throw new NotFoundError(`No location found with name of '${name}'`);
    }

    return location;
  }
}

module.exports = Location;