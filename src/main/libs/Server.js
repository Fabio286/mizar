'use strict';

const net = require('net');

class Server {
   constructor (process) {
      this.process = process;
      this.trace = false;
      this.echo = false;
      this.alertReset = false;
      this.ports = [];
      this.server = [];
      this.nBytes = [];
      this.nMsgs = [];
   }

   /**
    * Setta le porte
    *
    * @param {*} ports
    * @memberof Server
    */
   setPorts (ports) {
      this.ports = ports;
   }

   /**
    * Invia i log al render process
    *
    * @param {string} message Messaggio del log
    * @param {string} [color=''] Colore del log (green, yellow, red)
    * @memberof Server
    */
   sendLog (message, color = '') {
      let log = {
         event: 'log',
         content: { message, color }
      };
      this.process.send(log);
   }

   startServer (params) {
      let self = this;

      self.trace = params.trace;
      self.echo = params.echo;
      self.alertReset = params.alertReset;

      for (let i = 0; i < self.ports.length; i++) {
         let port = self.ports[i].port;

         self.server[i] = net.createServer();
         self.nBytes[i] = 0;
         self.nMsgs[i] = 0;

         self.server[i].on('connection', socket => {
            if (self.trace) self.sendLog(`Client connesso su porta ${port}`);

            socket.on('data', msg => {
               let msgString = msg.toString();
               if (self.echo) socket.write(msg);
               self.nBytes[i] += msg.length;
               self.nMsgs[i]++;

               if (self.trace) self.sendLog(`Messaggio ricevuto su porta ${port}: ${msgString}`);
            });// <- socket data

            socket.on('end', () => {
               if (self.trace) self.sendLog(`Client disconnesso su porta ${port}`);
            });

            socket.on('error', (err) => {
               switch (err.code) {
                  case 'ECONNRESET':
                     if (self.alertReset)
                        self.sendLog(`Errore client su porta ${port}: \n${err}`, 'yellow');
                     else
                     if (self.trace) self.sendLog(`Client disconnesso su porta ${port}`);
                     break;
                  default:
                     self.sendLog(`Errore client su porta ${port}: \n${err}`, 'red');
               }
            });
         });// <- server

         self.server[i].on('error', err => {
            self.sendLog(`Errore server su porta ${port}: \n${err}`, 'red');
         });

         self.server[i].listen(port, () => {
            self.sendLog(`In ascolto sulla porta ${port}`);
         });
      }
   }

   stopServer (callback) {
      let self = this;
      (async () => {
         for (let i = 0; i < self.server.length; i++) {
            await self.server[i].close(function () {
               self.server[i].unref();
            });
         }
         callback();
      })();
   }

   getReports () {
      let self = this;
      let reportList = [];
      for (let i = 0; i < self.server.length; i++) {
         let report = {
            port: self.server[i].address().port,
            sockets: null,
            data: self.nBytes[i],
            messages: self.nMsgs[i]
         };

         self.server[i].getConnections((err, nSockets) => {
            if (err) self.sendLog(`Errore report: \n${err}`, 'red');
            report.sockets = nSockets;
            reportList.push(report);

            if ((i + 1) === self.server.length) {
               let rep = {
                  event: 'report',
                  content: reportList
               };
               self.process.send(rep);
            }
         });
      }
   }

   resetReports () {
      let self = this;
      for (let i = 0; i < self.server.length; i++) {
         self.nBytes[i] = 0;
         self.nMsgs[i] = 0;
      }
   }
}
module.exports = Server;
