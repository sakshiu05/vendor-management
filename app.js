var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
// var logger = require('morgan');
var mongoose = require("mongoose");
// let winstonLogger = require('./logger/log');
const bodyParser = require("body-parser");
let expressValidator = require("express-validator");
var cors = require("cors");
var config = require("./config");
var passport = require("passport");
var Strategy = require("passport-facebook").Strategy;
const fs = require("fs");
// const settingsRoute = require('./apis/settings/settings.route');
var compression = require("compression");
const nocache = require("nocache");
let http = require("http");
/*
 * --------------------------------------------------------------------------
 *  DB connection import to database.js file
 * ---------------------------------------------------------------------------
 */
let app = express(); //comment
var allowedOrigins = [];

if (process.env.NODE_ENV === "production") {
  allowedOrigins = ["http://15.206.252.59:3000/"];
} else if (process.env.NODE_ENV === "development") {
  allowedOrigins = ["http://15.206.252.59:8080/", "http://localhost:8080"];
}

/* app = express().use(bodyParser.json())
  .use(morgan('dev'))
  .use(router)
  .use(cors({
    origin: function(origin, callback){
      // allow requests with no origin 
      // (like mobile apps or curl requests)
      if(!origin) return callback(null, true);
      if(allowedOrigins.indexOf(origin) === -1){
        var msg = 'The CORS policy for this site does not ' +
                  'allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ['GET', 'PATCH', 'PUT', 'POST', 'DELETE'],
    allowedOrigins: allowedOrigins
  })); */

var server = http.createServer(app);
var commonController = require("./apis/common/commonfunction");
var cronController = require("./apis/controllers/cronController");
mongoose.Promise = global.Promise;
app.set("env", config.NODE_ENV);
app.set("port", process.env.PORT || 3000);
require("./apis/common/database")(app, mongoose);

//create server and create socket connection
let io = require("socket.io")(server);
io.on("connection", (socket) => {
  app.set("socket", socket);
  console.log(`socket connected ${socket.id}`);
});
app.use((req, res, next) => {
  req.io = io;
  next();
});

/*
 * --------------------------------------------------------------------------
 *  view engine setup
 * ---------------------------------------------------------------------------
 */
// app.disable('etag');
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// app.use(logger('dev'));
app.use(cors());
app.options("*", cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// compress all responses
app.use(compression());

// app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(
  "/api/resourceResume",
  express.static(__dirname + "/apis/resourceResume")
);
app.use(
  "/api/resourceImage",
  express.static(__dirname + "/apis/resourceImage")
);
app.use("/api/userImage", express.static(__dirname + "/apis/userImage"));

// To print Called API Method and end-point
app.use("/", function (req, res, next) {
  // console.log(process.env.NODE_ENV);
  console.log(req.method + " " + req.url);
  next();
});

/*
 * --------------------------------------------------------------------------
 *  Importining API routers
 * ---------------------------------------------------------------------------
 */
// const SwaggerUI = require('swagger-ui');
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const customCss = fs.readFileSync(process.cwd() + "/swagger-ui.css", "utf8");
let tasks = [
  {
    id: 1,
    task: "task1",
    assignee: "assignee1000",
    status: "completed",
  },
  {
    id: 2,
    task: "task2",
    assignee: "assignee1001",
    status: "completed",
  },
];
/**
 * @swagger
 * /customers:
 * get:
 *    description: abba jabba dabba
 *    responses:
 *      '200':
 *      name: hh
 */
app.get("/api/todos", (req, res) => {
  console.log("api/todos called!!!!!");
  res.json(tasks);
});
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node JS API Project",
      version: "1.0.0",
    },
    servers: {
      url: "http://localhost:8080/",
    },
  },
  apis: ["app.js"], // ./apis/routes.index.js
};
const swaggerSpec = swaggerJSDoc(options);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, { customCss }) //swaggerDocument, swaggerSpec
);

let routes = require("./apis/routes");
app.use("/api", routes);

/*
 * --------------------------------------------------------------------------
 *  Creating default Admin entry from common/commonfunction
 * ---------------------------------------------------------------------------
 */

commonController.createDefaultAdmin(() => {});
cronController.common_cron(() => {});

// Configure view engine to render EJS templates.
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

/*
 * --------------------------------------------------------------------------
 *  catch 404 and forward to error handler
 * ---------------------------------------------------------------------------
 */

app.use(function (req, res, next) {
  next(createError(404));
});

/*
 * --------------------------------------------------------------------------
 *  error handler
 * ---------------------------------------------------------------------------
 */
app.use(function (err, req, res, next) {
  if (err.message == "Not Found") {
    console.log("End point not exist");
    return res.status(404).json({ message: "End point not exist" });
  }
  console.log("In Error Handler");
  console.log(err);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.json(res.locals);
});

String.prototype.toObjectId = function () {
  var ObjectId = require("mongoose").Types.ObjectId;
  return new ObjectId(this.toString());
};

server.listen(process.env.PORT, function () {
  console.log("listening on *:", server.address().port);
  console.log(`Your port is ${process.env.PORT}`);
  console.log(`Your port is ${process.env.NODE_ENV}`);
});
