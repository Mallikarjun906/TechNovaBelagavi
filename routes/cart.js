const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'nexus3d_super_secret_key';

// Middleware to authenticate
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Get user cart
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.productId');
    res.json(user.cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add to cart
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    let user = await User.findById(req.user.id);
    
    // Check if product already in cart
    const cartItemIndex = user.cart.findIndex(item => item.productId.toString() === productId);
    
    if (cartItemIndex > -1) {
      // Product exists, update quantity
      user.cart[cartItemIndex].quantity += (quantity || 1);
    } else {
      // Add new product
      user.cart.push({ productId, quantity: quantity || 1 });
    }
    
    await user.save();
    res.json(user.cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Remove from cart
router.post('/remove', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;
    let user = await User.findById(req.user.id);
    
    user.cart = user.cart.filter(item => item.productId.toString() !== productId);
    
    await user.save();
    res.json(user.cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
