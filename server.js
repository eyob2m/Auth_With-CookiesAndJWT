const express = require("express");
const app = express();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
app.use(express.json());
app.use(cookieParser());

// Connect to mongoDB
mongoose.connect(process.env.MONGOURL);
// User schema
const US = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
});

const UM = mongoose.model("User", US);

// Sign up 
app.post("/signup", async (req, res) => {
  21;
  const { email, password, name } = req?.body;
  if (!email || !password || !name)
    return res.json({ success: false, message: "Fill all" });
  const user = await UM.create(req.body);
  return res.json({ success: true, data: user });
});

// Log in
app.post("/login", async (req, res) => {
  const { email, password } = req?.body;
  if (!email || !password) return res.json({ success: false });
  const user = await UM.findOne({ email: email });

  if (!user) return res.json({ success: false, message: "No user" });
  const token = jwt.sign({ id: user._id }, process.env.Secret, {
    expiresIn: "3d",
  });
  res.cookie("UserToken", token, {
    httpOnly: true,
    secure: true,
    maxAge: 5 * 60 * 1000,
  });
  return res.json({ success: true, data: user });
});

// Logout

app.get("/logout", async (req, res) => {
  res.clearCookie("UserToken");
  return res.json({ success: true });
});

// Home page

app.get("/", async (req, res) => {
  const cookie = req.cookies;

  if (!cookie) return res.json({ success: false, message: "no cookies" });
  const UserToken = cookie.UserToken;

  if (!UserToken)
    return res.json({ success: false, message: "please log in again" });
  const decode = jwt.verify(UserToken, process.env.Secret);
  console.log(decode);
  if (!decode.id) return res.json({ success: false, message: "error cookies" });

  const user = await UM.findById(decode.id);
  return res.json({ success: true, data: user });
});
app.listen(3000);
