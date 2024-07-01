const express = require('express');
const axios = require('axios');
const geoip = require('geoip-lite');
require('dotenv').config();
const cron = require('node-cron');

const app = express();
const port = process.env.PORT || 3000;


// Middleware to get the client IP
app.use((req, res, next) => {
    req.clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    next();
});

app.get('/api/hello', async (req, res) => {
    try {
        const visitorName = req.query.visitor_name || 'Guest';
        const clientIp = req.clientIp;
        
         /// Get location from IP
        const geo = geoip.lookup(clientIp);
        const city = geo ? geo.city : 'Unknown';
        
        // Get weather data
        const weatherApiKey = process.env.WEATHER_API_KEY;
        const weatherResponse = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${weatherApiKey}`);
        const temperature = weatherResponse.data.main.temp;

        const response = {
            client_ip: clientIp,
            location: city,
            greeting: `Hello, ${visitorName}! The temperature is ${temperature} degrees Celsius in ${city}`
        };

        res.json(response);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// Add a new route for the ping
app.get('/ping', (req, res) => {
    console.log('Ping received at', new Date().toISOString());
    res.send('Pong!');
});

// Set up the cron job to run every 4 minutes
cron.schedule('*/4 * * * *', async () => {
    try {
        const response = await axios.get(`http://localhost:${port}/ping`);
        console.log('Cron job executed:', response.data);
    } catch (error) {
        console.error('Error in cron job:', error.message);
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});