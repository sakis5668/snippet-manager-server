const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


router.post("/", async (req, res) => {
  try {
    const { email, password, passwordVerify } = req.body;

    // validation
    if (!email || !password || !passwordVerify) {
      return res.status(400).json({ errorMessage: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ errorMessage: "Password must be at least 6 characters long" });
    }

    if (password !== passwordVerify) {
      return res.status(400).json({ errorMessage: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ errorMessage: "An account with this email already exists" });
    }

    // hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // save the new user account to the database
    const newUser = new User({ email, passwordHash });
    const savedUser = await newUser.save();

    // create a JWT token
    const jwtData = {
      id: savedUser._id,
    };
    const token = jwt.sign(jwtData, process.env.JWT_SECRET);

    // send the token in a HTTP-only cookie
    res.cookie("token", token, { httpOnly: true }).send();
  } catch (error) {
    res.status(500).send();
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({ errorMessage: "All fields are required" });
    }

    // get user account
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({ errorMessage: "Wrong email or password" });
    }

    const passwordCorrect = await bcrypt.compare(
      password,
      existingUser.passwordHash
    );
    if (!passwordCorrect) {
      return res.status(401).json({ errorMessage: "Wrong email or password" });
    }

    // create a JWT token
    const jwtData = {
      id: existingUser._id,
    };
    const token = jwt.sign(jwtData, process.env.JWT_SECRET);

    // send the token in a HTTP-only cookie
    res.cookie("token", token, { httpOnly: true }).send();
  } catch (error) {
    res.status(500).send();
  }
});

router.get("/loggedIn", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.json(null);

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    res.json(verified.id);

  } catch (error) {
    return res.json(null);
  }
});

router.get("/logout", (req, res) => {
  try {
    res.clearCookie("token").send();
  } catch (error) {
    return res.json(null);
  }
});

module.exports = router;
