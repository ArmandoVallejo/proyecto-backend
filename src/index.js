const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const logger = require('./middleware/logger');
const projectRoutes = require('./routes/projectRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

app.get('/', (req, res) => {
  res.json({ message: 'Servidor funcionando correctamente' });
});

app.use('/api', projectRoutes);

module.exports = app;