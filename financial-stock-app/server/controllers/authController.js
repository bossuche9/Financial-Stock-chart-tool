
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const asyncHandler = require("express-async-handler");

const registerUser = asyncHandler(async (req, res, next) => {

  console.log("Received registration request:", req.body);
    const existingUserEmail = await User.findOne({ email: req.body.email });
    const existingUserName = await User.findOne({username:req.body.username});
    if (existingUserEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    if (existingUserName) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    if(req.body.password.length < 6) {
      return res.status(400).json({ error: 'Password length too short. Must be at least 6 characters' });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    

    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } );

const loginUser = asyncHandler(async (req, res, next) => {
  
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ error: 'Email does not exist' });
    }

    const passwordMatch = await bcrypt.compare(req.body.password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ email: user.email }, 'secret');
    res.status(200).json({ token });
    console.log(`${user} logged in Successfully`);
  } );

const getUserDetails = asyncHandler(async (req, res, next) => {
  
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ username: user.username, email: user.email, password: user.password });
  } );

  const deleteUser = asyncHandler(async(req,res,next) => {
    const user = await User.findOne({
     $or: [
        { email: req.body.email},
        { username: req.body.username }
     ] 
    })

    if (!user) {
      return res.status(401).json({ error: 'Email/Username does not exist' });
    }

    const passwordMatch = await bcrypt.compare(req.body.password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    await User.findByIdAndDelete(user._id);

    res.status(200).json({ message: 'User deleted successfully' });
  });
  
  const forgetPassword = asyncHandler(async(req,res) => {
    const user = await User.findOne({ email: req.body.email});

    if (!user) {
      return res.status(404).json({message: "User not found"});
    }

   // const token
  });

module.exports = { registerUser, loginUser, getUserDetails, deleteUser };


