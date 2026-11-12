require('dotenv').config();

const http = require('http');
const validateEnv = require('./config/validateEnv');

validateEnv();

const connectDB = require('./config/db');
const app = require('./app');
const { initSocket } = require('./sockets');

connectDB();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});