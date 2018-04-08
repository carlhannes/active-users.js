const express = require('express');
const expressWs = require('express-ws');
const fs = require('fs');

const app = express();

let numClients = 0;
let oldClients = 0;

expressWs(app);

const whitelist = [
  /file:\/\//i,
  /localhost/i,
  /.?carlhannes\.se$/i,
  /.?teknikveckan\.com$/i,
  /.?imarknaden\.se$/i,
  /.?yoyoxno\.com$/i,
];

const sockets = [];

// If origin is set, check it
const checkOrigin = function checkOrigin(req, res, next) {
  const origin = req.header('Origin');
  if (typeof origin === 'string') {
    for (let i = 0; i < whitelist.length; i += 1) {
      if (whitelist[i].test(origin)) {
        next();
        return;
      }
    }
    res.sendStatus(403);
    return;
  }
  next();
};

app.use(checkOrigin);

app.ws('/global', (ws) => {
  sockets.push(ws);
});

setInterval(() => {
  const pruneSockets = [];
  numClients = sockets.length;

  sockets.forEach((ws, index) => {
    try {
      ws.ping('heartbeat');

      if (oldClients !== numClients) {
        ws.send(numClients.toString());
      }
    } catch (e) {
      pruneSockets.push(index);
    }
  });

  if (oldClients !== numClients) {
    console.log('Currently', numClients, 'active users');
  }

  for (let i = pruneSockets.length - 1; i >= 0; i -= 1) {
    sockets.splice(pruneSockets[i], 1);
  }

  oldClients = numClients;
}, 1000);

app.get('/', (req, res) => {
  res.send(numClients.toString());
});

app.get('/client.js', (req, res) => {
  fs.readFile('client.js', 'utf8', (err, data) => {
    if (err) {
      res.sendStatus(500);
    }
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(data);
  });
});

app.listen(3000, () => console.log('Server up & running'));
