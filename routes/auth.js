const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'nexus3d_super_secret_key';

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password are required' });
    }

    // Check for existing username or email
    let userByName = await User.findOne({ username });
    if (userByName) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    let userByEmail = await User.findOne({ email });
    if (userByEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = new User({
      username,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    const payload = { user: { id: user.id, isAdmin: user.isAdmin } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
    
    res.json({ token, message: 'Registration successful', username: user.username, isAdmin: user.isAdmin });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Admin check
    if (username === 'admin' && password === 'admin123') {
      const payload = { user: { id: 'admin', isAdmin: true } };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
      return res.json({ token, message: 'Admin login successful', username: 'admin', isAdmin: true });
    }
    
    let user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid Credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid Credentials' });
    }
    
    const payload = { user: { id: user.id, isAdmin: user.isAdmin } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
    
    res.json({ token, message: 'Login successful', username: user.username, isAdmin: user.isAdmin });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
