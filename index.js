const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://snippet.rembetologio.gr"],
    credentials: true,
    sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
    secure: process.env.NODE_ENV === "development" ? false : true,
  })
);
app.use(cookieParser());

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use("/snippet", require("./routers/snippetRouter"));
app.use("/auth", require("./routers/userRouter"));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

