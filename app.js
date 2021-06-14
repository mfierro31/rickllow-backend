const express = require("express");
const app = express();
const cors = require("cors");

const { NotFoundError } = require('./expressErrors');

const locationsRoutes = require('./routes/locations');

app.use(cors());
app.use(express.json());

app.use('/locations', locationsRoutes);

/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;