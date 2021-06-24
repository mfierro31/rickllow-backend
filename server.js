const app = require('./app');
const PORT = +process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Started on http://localhost:${PORT}`);
});