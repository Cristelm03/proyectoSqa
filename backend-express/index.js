//import app
const app = require("./app");

//define port
const port = process.env.PORT || 3000;

//start server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
