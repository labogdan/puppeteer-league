const fs = require("fs");
const path = require("path");
const { playlouisianasoccer } = require("./controllers/playlouisianasoccer");
const { alaskayouthsoccer } = require("./controllers/alaskayouthsoccer");
const { azsoccerassociation } = require("./controllers/azsoccerassociation");
const { coloradosoccer } = require("./controllers/coloradosoccer");
const { ecnlboys } = require("./controllers/ecnlboys");
const { girlsacademyleague } = require("./controllers/girlsacademyleague");
const { hawaiisoccer } = require("./controllers/hawaiisoccer");
const { kansasyouthsoccer } = require("./controllers/kansasyouthsoccer");
const { kysoccer } = require("./controllers/kysoccer");
const { missourisoccer } = require("./controllers/missourisoccer");
const { mlssoccer } = require("./controllers/mlssoccer");
const { mnyouthsoccer } = require("./controllers/mnyouthsoccer");
const { montanayouthsoccer } = require("./controllers/montanayouthsoccer");
const { nebraskastatesoccer } = require("./controllers/nebraskastatesoccer");
const { nevadayouthsoccer } = require("./controllers/nevadayouthsoccer");
const { ntxsoccer } = require("./controllers/ntxsoccer-urls");
const { nyswysa } = require("./controllers/nyswysa");
const { ohiosoccer } = require("./controllers/ohiosoccer");
const { soccerindiana } = require("./controllers/soccerindiana");
const { soccermaine } = require("./controllers/soccermaine");

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
        case 'coloradosoccer':
          console.log('coloradosoccer');
          coloradosoccer(socket);
        break;
        case 'ecnlboys':
          console.log('ecnlboys');
          ecnlboys(socket);
        break;
        case 'girlsacademyleague':
          console.log('girlsacademyleague');
          girlsacademyleague(socket);
        break;
        case 'hawaiisoccer':
          console.log('hawaiisoccer');
          hawaiisoccer(socket);
        break;
        case 'kansasyouthsoccer':
          console.log('kansasyouthsoccer');
          kansasyouthsoccer(socket);
        break;
        case 'kysoccer':
          console.log('kysoccer');
          kysoccer(socket);
        break;
        case 'missourisoccer':
          console.log('missourisoccer');
          missourisoccer(socket);
        break;
        case 'mlssoccer':
          console.log('mlssoccer');
          mlssoccer(socket);
        break;
        case 'mnyouthsoccer':
          console.log('mnyouthsoccer');
          mnyouthsoccer(socket);
        break;
        case 'montanayouthsoccer':
          console.log('montanayouthsoccer');
          montanayouthsoccer(socket);
        break;
        case 'nebraskastatesoccer':
          console.log('nebraskastatesoccer');
          nebraskastatesoccer(socket);
        break;
        case 'nevadayouthsoccer':
          console.log('nevadayouthsoccer');
          nevadayouthsoccer(socket);
        break;
        case 'ntxsoccer':
          console.log('ntxsoccer');
          ntxsoccer(socket);
        break;
        case 'nyswysa':
          console.log('nyswysa');
          nyswysa(socket);
        break;
        case 'ohiosoccer':
          console.log('ohiosoccer');
          ohiosoccer(socket);
        break;
        case 'soccerindiana':
          console.log('soccerindiana');
          soccerindiana(socket);
        break;
        case 'soccermaine':
          console.log('soccermaine');
          soccermaine(socket);
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