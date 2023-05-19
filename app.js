const express = require('express');
const bodyParser = require('body-parser');
const path = require("path");

const puppeteer = require('puppeteer');
const fs = require("fs");

const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 8080;

// application/json
app.use(bodyParser.json());

// to get access to the server from any domain like postman.
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

//declaration of the routes.
app.use('/api', apiRoutes);
app.use(express.static(path.resolve(__dirname, "./frontend/build")));

app.get("*", (req, res) => {
    let url = path.join(__dirname, 'frontend/build', 'index.html');
    if (!url.startsWith('/app/'))
        url = url.substring(1);
    res.sendFile(url);
});


app.listen(PORT);
