const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 3000;

app.get('/api/hello', async (req, res) => {
    try {
        const visitorName = req.query.visitor_name || 'Guest';
        
        // Get location from IP
        const ipapiResponse = await axios.get('https://ipapi.co/json/');
        const clientIp = ipapiResponse.data.ip;
        const city = ipapiResponse.data.city || 'Unknown';
        
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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});