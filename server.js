const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', apiRoutes);

// Statik dosya sunumu
app.use(express.static(path.join(__dirname, 'public')));

// Sunucu başlat
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Sunucu başlatıldı!`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📂 Statik dosyalar: ${path.join(__dirname, 'public')}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});