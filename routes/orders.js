const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
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

// Middleware for Admin
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ msg: 'Access denied: Admins only' });
  }
};

// Checkout (User)
router.post('/checkout', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.productId');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    if (!user.cart || user.cart.length === 0) return res.status(400).json({ msg: 'Cart is empty' });

    let totalAmount = 0;
    const orderProducts = user.cart.map(item => {
      totalAmount += item.productId.price * item.quantity;
      return {
        productId: item.productId._id,
        quantity: item.quantity
      };
    });

    const newOrder = new Order({
      userId: user._id,
      products: orderProducts,
      totalAmount
    });

    await newOrder.save();

    // Clear user cart
    user.cart = [];
    await user.save();

    res.json({ msg: 'Order placed successfully', orderId: newOrder._id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get all orders (Admin)
router.get('/', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'username').populate('products.productId').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
