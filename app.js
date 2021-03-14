const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const cors = require("cors");

const usersRoutes = require("./routes/api/users");
const expensesRoutes = require("./routes/api/expenses");  

const MONGO_URI = require('./config/keys').mongoURI;

const app = express();
const PORT = process.env.PORT || 4002;

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());
app.use(cors());

// Passport middleware
app.use(passport.initialize());
// Passport config
require("./config/passport")(passport);
// Routes
app.use("/api/users", usersRoutes);
app.use("/api/expense", expensesRoutes);
app.use('/', (req, res) => {
  res.send("/ route works")
})

mongoose.connect(
  MONGO_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connection with database established");
    app.listen(PORT, (err) => {
      if (err) console.log("Error while listening", err);
      else console.log(`Listening to port ${PORT}`);
    });
  }
);
