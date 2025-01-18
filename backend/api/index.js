// app.js
require("module-alias/register");

const express = require('express');
const cors = require('cors');
const gemini_router = require('@routers/GeminiRoutes');
require('dotenv').config();

const app = express();

// Middleware to parse JSON bodies
app.use(cors());
app.use(express.json());
app.use('/api', gemini_router);

// Start the server
const PORT = process.env.PORT || 3000;
const ENVIRONMENT = process.env.ENVIRONMENT || 'dev';

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
