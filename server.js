require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

console.log("📦 API dosyası yüklendi:", apiRoutes);


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);
app.use(express.static(path.join(__dirname, 'public')));


app.listen(PORT, () => {
  console.log(`✅ Server started on http://localhost:${PORT}`);
});