CREATE TABLE users (
  username TEXT PRIMARY KEY
);

-- NICE TO HAVE version of users
-- CREATE TABLE users (
--   id SERIAL PRIMARY KEY,
--   username TEXT NOT NULL,
--   password TEXT NOT NULL,
--   first_name TEXT NOT NULL,
--   last_name TEXT NOT NULL,
--   email TEXT NOT NULL
-- );

CREATE TABLE agents (
  name TEXT PRIMARY KEY,
  image TEXT NOT NULL
);

CREATE TABLE locations (
  name TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  dimension TEXT NOT NULL,
  description TEXT NOT NULL,
  cost INTEGER NOT NULL,
  alt_cost_curr TEXT,
  alt_cost_amt INTEGER,
  neighborhood TEXT NOT NULL,
  agent_name TEXT NOT NULL REFERENCES agents 
);

CREATE TABLE location_images (
  name TEXT PRIMARY KEY,
  location_name TEXT NOT NULL REFERENCES locations
);

CREATE TABLE favorites (
  user_username TEXT NOT NULL REFERENCES users,
  location_name TEXT NOT NULL REFERENCES locations,
  PRIMARY KEY (user_username, location_name)
);

CREATE TABLE viewings (
  id SERIAL PRIMARY KEY,
  location_name TEXT NOT NULL REFERENCES locations,
  user_username TEXT NOT NULL REFERENCES users,
  date TEXT NOT NULL
);

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  user_username TEXT NOT NULL REFERENCES users,
  location_name TEXT NOT NULL REFERENCES locations
);