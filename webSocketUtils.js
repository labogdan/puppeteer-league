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
const { upslsoccer } = require("./controllers/upslsoccer");
const { sylsoccerconnect } = require("./controllers/sylsoccerconnect");
const { uslwleague } = require("./controllers/uslwleague");
const { ushl } = require("./controllers/ushl");
const { nahl } = require("./controllers/nahl");
const { nahlfinal} = require("./controllers/nahl-final") ;
const { nahl3 } = require("./controllers/nahl3");
const { nahl3final } = require("./controllers/nahl3-final");

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
        case 'upslsoccer':
          console.log('upslsoccer');
          upslsoccer(socket);
        break;
        case 'sylsoccerconnect':
          console.log('sylsoccerconnect');
          sylsoccerconnect(socket);
        break;
        case 'uslwleague':
          console.log('uslwleague');
          uslwleague(socket);
        break;
        case 'ushl':
          console.log('ushl');
          ushl(socket);
        break;
        case 'nahl':
          console.log('nahl');
          nahl(socket);
        break;
        case 'nahl-final':
          console.log('nahlfinal');
          nahlfinal(socket);
        break;
        case 'nahl3':
          console.log('nahl3');
          nahl3(socket);
        break;
        case 'nahl3-final':
          console.log('nahl3final');
          nahl3final(socket);
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