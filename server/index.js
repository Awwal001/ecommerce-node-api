import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './urls/user.js';
import authRoutes from './urls/auth.js';
import cartRoutes from './urls/cart.js';
import orderRoutes from './urls/order.js';
import productRoutes from './urls/product.js';


const app = express();
dotenv.config();

app.use(express.json());
app.use('/api/user', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/product', productRoutes);

const PORT = process.env.PORT|| 5000;

mongoose.connect(process.env.MONGO_URL,  { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(PORT, () => console.log(`Server Running on Port: http://localhost:${PORT}`)))
  .catch((error) => console.log(`${error} did not connect`));

