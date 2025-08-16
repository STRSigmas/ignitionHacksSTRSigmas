const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8080;

// Middleware and static routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/bootstrap", express.static(path.join(__dirname, 'bootstrap')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// Route handlers
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/test', (req, res) => {
    res.send('Test route works!');
});

// API endpoints
app.get('/api/spots', (req, res) => {
  const spotsPath = path.join(__dirname, 'spots.json');
  fs.readFile(spotsPath, 'utf8', (err, data) => {
    if (err) {
      console.error("Failed to read spots.json:", err);
      return res.status(500).json({ error: 'Failed to read spots data.' });
    }

    try {
      const spots = JSON.parse(data);
      res.json(spots);
    } catch (parseErr) {
      console.error("Failed to parse spots.json:", parseErr);
      res.status(500).json({ error: 'Failed to parse spots data.' });
    }
  });
});

app.use((req, res) => {
    res.status(404).send('404 Not Found');
});

// Server startup
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});