const wsURL = 'ws://kayak.xno.se/global/';

const ws = new WebSocket(wsURL);

ws.onmessage = function onMessage(msg) {
  if (window && typeof window.chlUsersUpdate === 'function') {
    window.chlUsersUpdate(msg.data);
  }
};
