const fs = require("fs");
const path = require("path");
const { playlouisianasoccer } = require("./controllers/playlouisianasoccer");
const { alaskayouthsoccer } = require("./controllers/alaskayouthsoccer");
const { azsoccerassociation } = require("./controllers/azsoccerassociation");

exports.socketIO = (socket) => {
  socket.on('message', (message) => {
    console.log(`Received message from client: ${message}`);
    console.log(message === 'playlousianasoccer');
    console.log(typeof message);
    console.log(message.toString());
    switch (message.toString().split(':')[0]) {
        case 'playlousianasoccer':
          console.log('playlousianasoccer');
          playlouisianasoccer(socket, message.toString().split(':')[1]);
        break;
        case 'alaskayouthsoccer':
          console.log('alaskayouthsoccer');
          alaskayouthsoccer(socket);
        break;
        case 'azsoccerassociation':
          console.log('azsoccerassociation');
          azsoccerassociation(socket);
        break;

        default:
          socket.send('I did not understand what you said');
    }

  });

  socket.on('close', () => {
    console.log('Client disconnected');
  });
};

module.exports = exports;