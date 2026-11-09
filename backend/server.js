require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');
connectDB();
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ServiceConnect API is running',
  });
});

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);


app.use(notFound);
app.use(errorHandler);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});