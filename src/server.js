const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8080;

// Middleware to parse JSON in POST requests
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API to get study spots
app.get('/api/spots', (req, res) => {
    const spotsFile = path.join(__dirname, 'spots.json');
    fs.readFile(spotsFile, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read spots data.' });
        }
        try {
            const spots = JSON.parse(data);
            res.json(spots);
        } catch (parseErr) {
            res.status(500).json({ error: 'Failed to parse spots data.' });
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});