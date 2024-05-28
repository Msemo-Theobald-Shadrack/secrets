//jshint esversion:6
require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();
console.log(process.env.API_KEY);

//set EJS  as a templating engine.
app.set("view engine", "ejs");

//Serve static files from public directory.
app.use(express.static("public"));

//configure body-parser middle-ware.
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/userDB");

//create a user schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

//cut the secret code and paste it to the .env
//Replace secret with process.env.SECRET

userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ["password"],
});

//create a user model
const User = mongoose.model("User", userSchema);

app.get("/", function (req, res) {
  //Render the home.ejs template.
  res.render("home");
});

app.get("/login", function (req, res) {
  //Render the login.ejs template.
  res.render("login");
});
app.get("/register", function (req, res) {
  //Render the register.ejs template.
  res.render("register");
});

app.get("/secrets", function (req, res) {
  res.render("secrets");
});

app.post("/register", async function (req, res) {
  try {
    const email = req.body.username;
    const password = req.body.password;
    const user = new User({
      email: email,
      password: password,
    });
    await user.save();
    res.render("secrets");
  } catch (error) {
    console.error("Error occured when saving a new user.", error);
  }
});

app.post("/login", async function (req, res) {
  try {
    const username = req.body.username;
    const password = req.body.password;

    const foundItem = await User.findOne({ email: username });
    if (foundItem) {
      if (foundItem.password === password) {
        res.render("secrets");
      }
    } else {
      console.log("Incorrect email or password");
    }
  } catch (error) {
    console.error("Error occured", error);
    res.status(500).send("Internal server error occured.");
  }
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
