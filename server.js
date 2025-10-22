const express = require('express');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = 3000;

// Statik dosya sunumu
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

// API routes
app.use('/api', apiRoutes);

// Sunucu başlat
app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
});