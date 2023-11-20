//require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require("path");

const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: 'https://inclinedteststore.myshopify.com' }));

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
app.use(express.static(__dirname + '/frontend/build'));
app.use(express.static('public'));

// frontend app
/*app.get("*", (req, res) => {
    let url = path.join(__dirname, 'frontend/build', 'index.html');
    if (!url.startsWith('/app/'))
        url = url.substring(1);
    res.sendFile(url);
});*/


app.listen(PORT);


/*const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 3001;

app.get('/api/data', (req, res) => {
  res.json({ message: 'This is data from the backend' });
});

app.use(express.static(path.join(__dirname, './frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './frontend/build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
*/

/*

const express = require("express");

const http = require('http');
const WebSocket = require('ws');
const port = process.env.PORT || 8080;
const app = express();
const path = require("path");
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const fileUtils = require('./fileUtils');
const webSocketUtils = require('./webSocketUtils');

wss.on('connection', (socket) => {
  webSocketUtils.socketIO(socket);
});

const apiRoutes = require('./routes');

app.use('/api', apiRoutes);

app.get('/download', (req, res) => {
    fileUtils.downloadFile(req, res);
});

app.get('/delete', (req, res) => {
  fileUtils.deleteFile(req, res);
});

app.get('/check-file-exists', (req, res) => {
  fileUtils.checkFileExists(req, res);
});

app.use(express.static(path.join(__dirname, './frontend/build')));

app.use(express.static(__dirname + '/frontend/build'));
app.use(express.static('public'));


server.listen(port, () => {
  console.log(`WebSocket server is running on port ${port}`); 
});

*/



















/*
const express = require("express");
const http = require("http");
const cors = require('cors');

const port = process.env.PORT || 8080;
const app = express();

const server = http.createServer(app);

const io = require('socket.io')(server, {
cors: {
    origin: '*',
}
});

const apiRoutes = require('./routes');

app.use(express.static(__dirname + '/frontend/build'));
app.use('/api', apiRoutes);



let interval;

io.on("connection", (socket) => {
  console.log("New client connected");
  
  
  /*if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => getApiAndEmit(socket), 1000);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });*/


/*
  socket.emit('welcome', 'Welcome to the server!');

  setTimeout(() => {
    socket.emit('announcement', 'An important announcement!');
  }, 3000);

  setTimeout(() => {
    socket.emit('countdown', 10);
  }, 6000);*/

/*
  socket.on('messageToServer', (data) => {
    console.log('Received message from client:', data);
    // You can process the data and send a response back if needed
    socket.emit('messageFromServer', `Server received: ${data}`);
    console.log('Sent a response to the client');
  });
});

const getApiAndEmit = socket => {
  const response = new Date();
  // Emitting a new message. Will be consumed by the client
  console.log('emitting');
  socket.emit("FromAPI", response);
};

server.listen(port, () => console.log(`Listening on port ${port}`));


/*const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const socketIo = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});

const bodyParser = require('body-parser');
const path = require("path");

const puppeteer = require('puppeteer');
const fs = require("fs");

const apiRoutes = require('./routes');
const webRoutes = require('./webroutes');

const PORT = process.env.PORT || 8080;

// application/json
app.use(bodyParser.json());

app.use(express.static(__dirname + '/frontend/build'));

// Configure CORS with specific origins
const allowedOrigins = ['http://localhost:3000']; // Replace with your React app's URL
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};
app.use(cors(corsOptions));

//declaration of the routes.

app.get('/api/data', (req, res) => {
    const initialData = {
      updates: ['Initial update 1', 'Initial update 2']
    };
    res.json(initialData);
  });

  app.get('/api/someroute', (req, res) => {
    res.json({ message: 'Response from /api/someroute' });
  });

app.use('/api', apiRoutes);
//app.use(express.static(path.resolve(__dirname, "./frontend/build")));


socketIo.on('connection', (socket) => {
    console.log('Client connected');
  
    // Simulate long response and send periodic updates
    setTimeout(() => {
      const updates = ['Step 1', 'Step 2', 'Step 3'];
      updates.forEach((update, index) => {
        setTimeout(() => {
          socket.emit('update', update);
        }, index * 4000); // Send an update every 3 seconds
      });
    }, 10000); // Simulate long response after 5 seconds
  });


  server.listen(PORT, () => {
    console.log('Server is running on port 8080');
  });*/