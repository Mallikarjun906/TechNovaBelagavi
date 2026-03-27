const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname)));

// Models
const Product = require('./models/Product');

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/nexus3d')
  .then(async () => {
    console.log('MongoDB connected successfully');
    
    // Seed products if empty

    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('Seeding initial products...');
      const defaultProducts = [
        { name: 'NEXUS DRONE PRO X1', description: 'Next-gen 3D drone showcase', price: 2499, category: 'AERIAL · DRONE', imageUrl: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&q=80' },
        { name: 'VORTEX V12 ENGINE KIT', description: 'Interactive engine rebuild', price: 8999, category: 'AUTOMOTIVE · ENGINE', imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&q=80' },
        { name: 'CHRONOS S7 TITANIUM', description: 'Sapphire crystal watch', price: 4299, category: 'HOROLOGY · LUXURY', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80' },
        { name: 'NEXUS CONTROLLER PRO', description: 'Drone controller', price: 399, category: 'AERIAL · ACCESSORIES', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80' },
        { name: 'DRIFT KING FULL KIT', description: 'Full car chassis build', price: 24999, category: 'AUTOMOTIVE · FULL BUILD', imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80' },
        { name: 'NEXUS RACER FPV', description: 'FPV racing drone', price: 799, category: 'AERIAL · RACING', imageUrl: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600&q=80' }
      ];
      await Product.insertMany(defaultProducts);
      console.log('Initial products seeded!');
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Fallback to index.html for unknown routes (so SPA works correctly)
app.get('/*splat', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
