//import express
const express = require("express");

//import CORS
const cors = require("cors");

//import bodyParser
const bodyParser = require("body-parser");

//import router
const router = require("./routes");

//init app
const app = express();

//use cors
app.use(cors());

//use body parser
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

//define routes
app.use("/api", router);

//export app (the server is started in index.js)
module.exports = app;
