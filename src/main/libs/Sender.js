'use strict';

const net = require('net');
const fs = require('fs');

class Sender {
   /**
    *Creates an instance of Sender.
    * @param {*} process Processo dove inviare i log
    * @memberof Sender
    */
   constructor (process) {
      this.process = process;
      this.closeOnEcho = true;
      this.persistentConnection = false;
      this.nMsgs = 0;
      this.tMin = 0;
      this.tMax = 0;
      this.nClients = 1;
      this.trace = false;
      this.alertReset = false;
      this.hexMsg = false;
      this.nConnected = 0;
      this.nClosed = 0;
      this.nTryConnect = 0;
      this.nReceived = [];
      this.nSent = 0;
      this.timeStart = new Date();
      this.hosts = [];
      this.messages = [];
      this.nHostClients = [];
      this.nHostBytes = [];
      this.nHostMsgs = [];
      this.storagePath = '';
   }

   /**
    * Setta gli hosts
    *
    * @param {*} hosts
    * @memberof Sender
    */
   setHosts (hosts) {
      this.hosts = hosts;
   }

   /**
    * Setta i parametri del messaggio
    *
    * @param {*} params
    * @memberof Sender
    */
   setParams (params) {
      this.closeOnEcho = params.closeOnEcho;
      this.persistentConnection = params.persistentConnection;
      this.nMsgs = params.nMsgs;
      this.tMin = params.tMin;
      this.tMax = params.tMax;
      this.nClients = params.nClients;
      this.trace = params.trace;
      this.alertReset = params.alertReset;
      this.loop = params.loop;
   }

   /**
    * Setta il percorso della cartella storage
    *
    * @param {string} storagePath
    * @memberof Sender
    */
   setStoragePath (storagePath) {
      this.storagePath = storagePath;
   }

   /**
    * Carica i messaggi in memoria
    *
    * @memberof Sender
    */
   loadMessages () {
      let self = this;
      if (self.trace) this.sendLog('Lettura dei messaggi');
      let messages = fs.readFileSync(`${self.storagePath}/storage/clientMessages.json`);
      messages = JSON.parse(messages);
      this.messages = messages.filter((message) => {
         return message.enabled === true;
      });
      if (self.trace) this.sendLog(`Messaggi caricari: ${this.messages.length}`);
   }

   /**
    * Invia i log al render process
    *
    * @param {string} message Messaggio del log
    * @param {string} [color=''] Colore del log (green, yellow, red)
    * @memberof Sender
    */
   sendLog (message, color = '') {
      let log = {
         event: 'log',
         content: { message, color }
      };
      this.process.send(log);
   }

   /** Restituisce un messaggio casuale */
   randMsg () {
      let self = this;
      if (self.messages.length > 0) {
         let index = Math.floor((Math.random() * (self.messages.length)));
         let msg;

         switch (self.messages[index].format) {
            case 'ascii':
               msg = Buffer.from(self.messages[index].message, 'ascii');
               break;
            case 'hex':
               msg = Buffer.from(self.messages[index].message.replace(/\s|0x/g, ''), 'hex');
               break;
            case 'binary':
               msg = Buffer.from(self.messages[index].message.replace(/\s/g, ''), 'binary');
               break;
         }

         return msg;
      }
      else return 'Nessun messaggio specificato';
   };

   /**
    * Istanzia i client e invia i messaggi
    *
    * @param {*} params Parametri dei client
    * @memberof Sender
    */
   startFullTest (callback) {
      let self = this;

      /** Carica in memoria i messaggi */
      self.loadMessages();

      /** Applica uno sleep */
      function delay () {
         let wait = Math.floor((Math.random() * self.tMax) + self.tMin);
         return new Promise(resolve => setTimeout(resolve, wait));
      }

      for (let x = 0; x < self.hosts.length; x++) { // hosts for
         let params = self.hosts[x];
         self.hosts[x].clients = [];
         self.nHostClients[x] = 0;
         self.nHostMsgs[x] = self.nHostMsgs[x] === undefined ? 0 : self.nHostMsgs[x];
         self.nHostBytes[x] = self.nHostBytes[x] === undefined ? 0 : self.nHostBytes[x];
         self.nReceived[x] = self.nReceived[x] === undefined ? 0 : self.nReceived[x];

         for (let i = 0; i < self.nClients; i++) { // clients for
            self.hosts[x].clients[i] = new net.Socket();
            let client = self.hosts[x].clients[i];
            let clientId = i + 1;

            try {
               client.connect(params, () => {
                  if (self.trace) self.sendLog(`Socket #${clientId} su ${params.host}:${params.port} aperto`);
                  self.nHostClients[x]++;

                  (async () => {
                     for (let i = 0; i < self.nMsgs; i++) { // msg for
                        await delay();

                        let msg = self.randMsg();

                        client.write(msg, err => {
                           if (err)
                              self.sendLog(`Socket #${clientId} su ${params.host}:${params.port}:\nErrore messaggio: ${err}`, 'red');
                           else {
                              self.nSent++;
                              self.nHostMsgs[x]++;
                              self.nHostBytes[x] += msg.length;
                           }
                        });

                        if (self.trace) self.sendLog(`Socket #${clientId} su ${params.host}:${params.port} messaggio #${i + 1}`);
                        if (i + 1 === self.nMsgs && !self.closeOnEcho && !self.persistentConnection) client.end();
                     }// <- msg for
                  })();
               });
            }
            catch (err) {
               self.sendLog(`Socket #${clientId} su ${params.host}:${params.port}:\n${err}`, 'red');
            }

            client.on('connect', err => {
               self.nTryConnect++;
               if (err)
                  self.sendLog(`Errore connessione #${clientId} su ${params.host}:${params.port}:\n${err}`, 'red');
               else
                  self.nConnected++;
                  // if (self.nConnected === (self.nClients * self.hosts.length)) self.getReport();
            });

            client.on('data', data => {
               self.nReceived[x]++;
               if (self.closeOnEcho)
                  client.end();

               if (self.trace) self.sendLog(`Socket #${clientId} su ${params.host}:${params.port} risposta: ${data}`);
            });

            client.on('close', () => {
               self.nClosed++;
               if (self.trace) self.sendLog(`Socket #${clientId} su ${params.host}:${params.port} chiuso`);

               // Misura tempo esecuzione
               if (self.nClosed === self.nTryConnect) {
                  if (!self.loop) self.getConsoleReports();
                  callback();
               }
            });

            client.on('error', err => {
               switch (err.code) {
                  case 'ECONNRESET':
                     if (self.alertReset)
                        self.sendLog(`Socket #${clientId} su ${params.host}:${params.port}:\n${err}`, 'yellow');

                     break;
                  default:
                     self.sendLog(`Socket #${clientId} su ${params.host}:${params.port}:\n${err}`, 'red');
               }
            });
         }// <- clients for
      }// <- hosts for
   }

   /**
    * Connette i client per il test a step
    *
    * @param {*} callback
    * @memberof Sender
    */
   connectClients (callback) {
      let self = this;
      for (let x = 0; x < self.hosts.length; x++) { // hosts for
         let params = self.hosts[x];
         self.hosts[x].clients = [];
         self.nHostMsgs[x] = 0;
         self.nHostBytes[x] = 0;
         self.nHostClients[x] = 0;
         self.nReceived[x] = 0;

         for (let i = 0; i < self.nClients; i++) { // clients for
            self.hosts[x].clients[i] = new net.Socket();
            let client = self.hosts[x].clients[i];
            let clientId = i + 1;

            try {
               client.connect(params, () => {
                  if (self.trace) self.sendLog(`Socket #${clientId} su ${params.host}:${params.port} aperto`);
                  self.nHostClients[x]++;
               });
            }
            catch (err) {
               self.sendLog(`Socket #${clientId} su ${params.host}:${params.port}:\n${err}`, 'red');
            }

            client.on('connect', err => {
               self.nTryConnect++;
               if (err)
                  self.sendLog(`Errore connessione #${clientId} su ${params.host}:${params.port}:\n${err}`, 'red');
               else
                  self.nConnected++;
                  // if (self.nConnected === (self.nClients * self.hosts.length)) self.getReport();

               if ((self.nClients * self.hosts.length) === self.nTryConnect) callback();
            });

            client.on('data', data => {
               self.nReceived[x]++;
               if (self.closeOnEcho)
                  client.end();

               if (self.trace) self.sendLog(`Socket #${clientId} su ${params.host}:${params.port} risposta: ${data}`);
            });

            client.on('close', () => {
               self.nClosed++;
               if (self.trace) self.sendLog(`Socket #${clientId} su ${params.host}:${params.port} chiuso`);
            });

            client.on('error', err => {
               switch (err.code) {
                  case 'ECONNRESET':
                     if (self.alertReset)
                        self.sendLog(`Socket #${clientId} su ${params.host}:${params.port}:\n${err}`, 'yellow');

                     break;
                  default:
                     self.sendLog(`Socket #${clientId} su ${params.host}:${params.port}:\n${err}`, 'red');
               }
            });
         }// <- clients for
      }// <- hosts for
   }

   /**
    * Invia i messaggi nella modalità a step
    *
    * @param {*} callback
    * @memberof Sender
    */
   sendMessages (callback) {
      let self = this;

      /** Carica in memoria i messaggi */
      self.loadMessages();

      self.nSent = 0;

      /** Applica uno sleep */
      function delay () {
         let wait = Math.floor((Math.random() * self.tMax) + self.tMin);
         return new Promise(resolve => setTimeout(resolve, wait));
      }

      for (let x = 0; x < self.hosts.length; x++) { // hosts for
         for (let i = 0; i < self.hosts[x].clients.length; i++) { // clients for
            let client = self.hosts[x].clients[i];
            let params = self.hosts[x];
            let clientId = i + 1;

            (async () => {
               for (let i = 0; i < self.nMsgs; i++) { // msg for
                  await delay();

                  let msg = self.randMsg();

                  client.write(msg, err => {
                     if (err)
                        self.sendLog(`Socket #${clientId} su ${params.host}:${params.port}:\nErrore messaggio: ${err}`, 'red');
                     else {
                        self.nSent++;
                        self.nHostMsgs[x]++;
                        self.nHostBytes[x] += msg.length;
                        if ((self.nMsgs * self.hosts.length * self.nClients) === self.nSent) callback();
                     }
                  });

                  if (self.trace) self.sendLog(`Socket #${clientId} su ${params.host}:${params.port} messaggio #${i + 1}`);
               }// <- msg for
            })();
         }// <- clients for
      }// <- hosts for
   }

   /** Genera il report su console */
   getConsoleReports () {
      let self = this;
      let end = new Date() - self.timeStart;
      let report = `Durata del test: ${end}ms`;

      self.sendLog(report, 'green');
   }

   stopClients (callback) {
      let self = this;
      for (let x = 0; x < self.hosts.length; x++) {
         for (let i = 0; i < self.hosts[x].clients.length; i++)
            self.hosts[x].clients[i].end();
      }

      self.getConsoleReports();
      callback();
   }

   getReports () {
      let self = this;
      let reportList = [];
      for (let i = 0; i < self.hosts.length; i++) {
         let report = {
            host: `${self.hosts[i].host}:${self.hosts[i].port}`,
            sockets: self.nHostClients[i],
            data: self.nHostBytes[i],
            messages: self.nHostMsgs[i],
            received: self.nReceived[i]
         };
         reportList.push(report);

         if ((i + 1) === self.hosts.length) {
            let rep = {
               event: 'report',
               content: reportList
            };
            self.process.send(rep);
         }
      }
   }

   resetReports () {
      let self = this;
      for (let i = 0; i < self.hosts.length; i++) {
         self.nHostBytes[i] = 0;
         self.nHostMsgs[i] = 0;
         self.nHostClients[i] = 0;
         self.nReceived[i] = 0;
      }
   }
}
module.exports = Sender;
