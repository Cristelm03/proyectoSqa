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

//do not disclose the framework (X-Powered-By: Express)
app.disable("x-powered-by");

//use cors: only the origins listed in CORS_ORIGIN (comma separated).
//The default is the Vite dev server of the frontend.
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173").split(",");
app.use(cors({ origin: allowedOrigins }));

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
