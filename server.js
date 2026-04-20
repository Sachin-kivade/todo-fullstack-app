require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const connectDB = require("./config/db");
const User = require("./models/user");
const Todo = require("./models/todo");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");



const SECRET_KEY = process.env.JWT_SECRET;
const app = express();


connectDB();

app.use(cors({ origin: "*" }));

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server is running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.post("/signup", async (req, res) => {
  try {
    let { username, email, password } = req.body;

    
    email = email.toLowerCase().trim();

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.json({ message: "Signup successful" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: "No token" });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, SECRET_KEY);

        req.user = decoded; 

        next();

    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

app.get("/todos", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;

        const todos = await Todo.find({ userId }).select("-userId");
        res.json({ todos });

    } catch (error) {
        res.status(500).json({ message: "Error fetching todos" });
    }
});

app.post("/todos", authMiddleware, async (req, res) => {
  try {

    const { title, date, priority } = req.body;
    const userId = req.user.userId;

    const newTodo = new Todo({
      title,
      userId,
      date: date || null,       
      priority: priority || "low"    
    });

    await newTodo.save();

    res.json({ message: "Todo added", todo: newTodo });
    console.log("SAVING TO DB:", newTodo);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error adding todo" });
  }
});

app.delete("/todos/:id", authMiddleware, async (req, res) => {
    try {
        await Todo.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting" });
    }
});

app.put("/todos/:id", authMiddleware, async (req, res) => {
  try {
    const { title, completed, date, priority } = req.body;

    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      {
        ...(title !== undefined && { title }),
        ...(completed !== undefined && { completed }),
        ...(date !== undefined && { date }),
        ...(priority !== undefined && { priority })
      },
      { new: true }
    );

    res.json(updatedTodo);

  } catch (error) {
    res.status(500).json({ message: "Error updating todo" });
  }
});

app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
 
    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    user.resetOTP = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;

    await user.save();

   
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        }
    });

    await transporter.sendMail({
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}`,
    });

    res.json({ message: "OTP sent to email" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email });

  const isMatch = await bcrypt.compare(otp, user.resetOTP);

  if (!isMatch) {
  return res.status(400).json({ message: "Invalid OTP" });
  }

  if (user.otpExpiry < Date.now()) {
    return res.status(400).json({ message: "OTP expired" });
  }

  
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  user.resetOTP = null;
  user.otpExpiry = null;

  await user.save();

  res.json({ message: "Password updated successfully" });
});
