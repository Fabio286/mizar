import * as net from 'net';
import { ClientHost, ClientMessage } from 'common/interfaces';
import * as ElectronStore from 'electron-store';
const persistentStore = new ElectronStore({ name: 'client' });

interface SenderParams {
   closeOnEcho: boolean;
   persistentConnection: boolean;
   nMsgs: number;
   tMin: number;
   tMax: number;
   nClients: number;
   trace: boolean;
   alertReset: boolean;
   loop: boolean;
}

class Sender {
   process: NodeJS.Process;
   closeOnEcho: boolean;
   persistentConnection: boolean;
   nMsgs: number;
   tMin: number;
   tMax: number;
   nClients: number;
   trace: boolean;
   alertReset: boolean;
   hexMsg: boolean;
   nConnected: number;
   nClosed: number;
   nTryConnect: number;
   nReceived: number[];
   nSent: number;
   timeStart: Date;
   hosts: ClientHost[];
   messages: ClientMessage[];
   nHostClients: number[];
   nHostBytes: number[];
   nHostMsgs: number[];
   loop: boolean;

   /**
    *Creates an instance of Sender.
    * @param {*} process Processo dove inviare i log
    * @memberof Sender
    */
   constructor (process: NodeJS.Process) {
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
   }

   /**
    * Setta gli hosts
    *
    * @param {*} hosts
    * @memberof Sender
    */
   setHosts (hosts: ClientHost[]) {
      this.hosts = hosts;
   }

   /**
    * Setta i parametri del messaggio
    *
    * @param {*} params
    * @memberof Sender
    */
   setParams (params: SenderParams) {
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
    * Carica i messaggi in memoria
    *
    * @memberof Sender
    */
   loadMessages () {
      if (this.trace) this.sendLog('Lettura dei messaggi');
      const messages = persistentStore.get('messages', []) as ClientMessage[];
      this.messages = messages.filter((message) => {
         return message.enabled === true;
      });
      if (this.trace) this.sendLog(`Messaggi caricari: ${this.messages.length}`);
   }

   /**
    * Invia i log al render process
    *
    * @param {string} message Messaggio del log
    * @param {string} [color=''] Colore del log (green, yellow, red)
    * @memberof Sender
    */
   sendLog (message: string, color = '') {
      const log = {
         event: 'log',
         content: { message, color }
      };
      this.process.send(log);
   }

   /** Restituisce un messaggio casuale */
   randMsg () {
      if (this.messages.length > 0) {
         const index = Math.floor((Math.random() * (this.messages.length)));
         let msg;

         switch (this.messages[index].format) {
            case 'ascii':
               msg = Buffer.from(this.messages[index].message, 'ascii');
               break;
            case 'hex':
               msg = Buffer.from(this.messages[index].message.replace(/\s|0x/g, ''), 'hex');
               break;
            case 'binary':
               msg = Buffer.from(this.messages[index].message.replace(/\s/g, ''), 'binary');
               break;
         }

         return msg;
      }
      else return 'Nessun messaggio specificato';
   }

   /**
    * Istanzia i client e invia i messaggi
    *
    * @param {*} params Parametri dei client
    * @memberof Sender
    */
   startFullTest (callback: () => void) {
      /** Carica in memoria i messaggi */
      this.loadMessages();

      /** Applica uno sleep */
      const delay = () => {
         const wait = Math.floor((Math.random() * this.tMax) + this.tMin);
         return new Promise(resolve => setTimeout(resolve, wait));
      };

      for (let x = 0; x < this.hosts.length; x++) { // hosts for
         const params = this.hosts[x];
         this.hosts[x].clients = [];
         this.nHostClients[x] = 0;
         this.nHostMsgs[x] = this.nHostMsgs[x] === undefined ? 0 : this.nHostMsgs[x];
         this.nHostBytes[x] = this.nHostBytes[x] === undefined ? 0 : this.nHostBytes[x];
         this.nReceived[x] = this.nReceived[x] === undefined ? 0 : this.nReceived[x];

         for (let i = 0; i < this.nClients; i++) { // clients for
            this.hosts[x].clients[i] = new net.Socket();
            const client = this.hosts[x].clients[i];
            const clientId = i + 1;

            try {
               client.connect(params, () => {
                  if (this.trace) this.sendLog(`Socket #${clientId} su ${params.host}:${params.port} aperto`);
                  this.nHostClients[x]++;

                  (async () => {
                     for (let i = 0; i < this.nMsgs; i++) { // msg for
                        await delay();

                        const msg = this.randMsg();

                        client.write(msg, (err: Error) => {
                           if (err)
                              this.sendLog(`Socket #${clientId} su ${params.host}:${params.port}:\nErrore messaggio: ${err}`, 'red');
                           else {
                              this.nSent++;
                              this.nHostMsgs[x]++;
                              this.nHostBytes[x] += msg.length;
                           }
                        });

                        if (this.trace) this.sendLog(`Socket #${clientId} su ${params.host}:${params.port} messaggio #${i + 1}`);
                        if (i + 1 === this.nMsgs && !this.closeOnEcho && !this.persistentConnection) client.end();
                     }// <- msg for
                  })();
               });
            }
            catch (err) {
               this.sendLog(`Socket #${clientId} su ${params.host}:${params.port}:\n${err}`, 'red');
            }

            client.on('connect', (err: Error) => {
               this.nTryConnect++;
               if (err)
                  this.sendLog(`Errore connessione #${clientId} su ${params.host}:${params.port}:\n${err}`, 'red');
               else
                  this.nConnected++;
                  // if (this.nConnected === (this.nClients * this.hosts.length)) this.getReport();
            });

            client.on('data', (data: Buffer) => {
               this.nReceived[x]++;
               if (this.closeOnEcho)
                  client.end();

               if (this.trace) this.sendLog(`Socket #${clientId} su ${params.host}:${params.port} risposta: ${data}`);
            });

            client.on('close', () => {
               this.nClosed++;
               if (this.trace) this.sendLog(`Socket #${clientId} su ${params.host}:${params.port} chiuso`);

               // Misura tempo esecuzione
               if (this.nClosed === this.nTryConnect) {
                  if (!this.loop) this.getConsoleReports();
                  callback();
               }
            });

            client.on('error', (err: Error & { code: string }) => {
               switch (err.code) {
                  case 'ECONNRESET':
                     if (this.alertReset)
                        this.sendLog(`Socket #${clientId} su ${params.host}:${params.port}:\n${err}`, 'yellow');

                     break;
                  default:
                     this.sendLog(`Socket #${clientId} su ${params.host}:${params.port}:\n${err}`, 'red');
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
   connectClients (callback: () => void) {
      for (let x = 0; x < this.hosts.length; x++) { // hosts for
         const params = this.hosts[x];
         this.hosts[x].clients = [];
         this.nHostMsgs[x] = 0;
         this.nHostBytes[x] = 0;
         this.nHostClients[x] = 0;
         this.nReceived[x] = 0;

         for (let i = 0; i < this.nClients; i++) { // clients for
            this.hosts[x].clients[i] = new net.Socket();
            const client = this.hosts[x].clients[i];
            const clientId = i + 1;

            try {
               client.connect(params, () => {
                  if (this.trace) this.sendLog(`Socket #${clientId} su ${params.host}:${params.port} aperto`);
                  this.nHostClients[x]++;
               });
            }
            catch (err) {
               this.sendLog(`Socket #${clientId} su ${params.host}:${params.port}:\n${err}`, 'red');
            }

            client.on('connect', (err: Error) => {
               this.nTryConnect++;
               if (err)
                  this.sendLog(`Errore connessione #${clientId} su ${params.host}:${params.port}:\n${err}`, 'red');
               else
                  this.nConnected++;
                  // if (this.nConnected === (this.nClients * this.hosts.length)) this.getReport();

               if ((this.nClients * this.hosts.length) === this.nTryConnect) callback();
            });

            client.on('data', (data: Buffer) => {
               this.nReceived[x]++;
               if (this.closeOnEcho)
                  client.end();

               if (this.trace) this.sendLog(`Socket #${clientId} su ${params.host}:${params.port} risposta: ${data}`);
            });

            client.on('close', () => {
               this.nClosed++;
               if (this.trace) this.sendLog(`Socket #${clientId} su ${params.host}:${params.port} chiuso`);
            });

            client.on('error', (err: Error & { code: string }) => {
               switch (err.code) {
                  case 'ECONNRESET':
                     if (this.alertReset)
                        this.sendLog(`Socket #${clientId} su ${params.host}:${params.port}:\n${err}`, 'yellow');

                     break;
                  default:
                     this.sendLog(`Socket #${clientId} su ${params.host}:${params.port}:\n${err}`, 'red');
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
   sendMessages (callback: () => void) {
      /** Carica in memoria i messaggi */
      this.loadMessages();

      this.nSent = 0;

      /** Applica uno sleep */
      function delay () {
         const wait = Math.floor((Math.random() * this.tMax) + this.tMin);
         return new Promise(resolve => setTimeout(resolve, wait));
      }

      for (let x = 0; x < this.hosts.length; x++) { // hosts for
         for (let i = 0; i < this.hosts[x].clients.length; i++) { // clients for
            const client = this.hosts[x].clients[i];
            const params = this.hosts[x];
            const clientId = i + 1;

            (async () => {
               for (let i = 0; i < this.nMsgs; i++) { // msg for
                  await delay();

                  const msg = this.randMsg();

                  client.write(msg, (err: Error) => {
                     if (err)
                        this.sendLog(`Socket #${clientId} su ${params.host}:${params.port}:\nErrore messaggio: ${err}`, 'red');
                     else {
                        this.nSent++;
                        this.nHostMsgs[x]++;
                        this.nHostBytes[x] += msg.length;
                        if ((this.nMsgs * this.hosts.length * this.nClients) === this.nSent) callback();
                     }
                  });

                  if (this.trace) this.sendLog(`Socket #${clientId} su ${params.host}:${params.port} messaggio #${i + 1}`);
               }// <- msg for
            })();
         }// <- clients for
      }// <- hosts for
   }

   /** Genera il report su console */
   getConsoleReports () {
      const end = new Date().getMilliseconds() - this.timeStart.getMilliseconds();
      const report = `Durata del test: ${end}ms`;

      this.sendLog(report, 'green');
   }

   stopClients (callback: () => void) {
      for (let x = 0; x < this.hosts.length; x++) {
         for (let i = 0; i < this.hosts[x].clients.length; i++)
            this.hosts[x].clients[i].end();
      }

      this.getConsoleReports();
      callback();
   }

   getReports () {
      const reportList = [];
      for (let i = 0; i < this.hosts.length; i++) {
         const report = {
            host: `${this.hosts[i].host}:${this.hosts[i].port}`,
            sockets: this.nHostClients[i],
            data: this.nHostBytes[i],
            messages: this.nHostMsgs[i],
            received: this.nReceived[i]
         };
         reportList.push(report);

         if ((i + 1) === this.hosts.length) {
            const rep = {
               event: 'report',
               content: reportList
            };
            this.process.send(rep);
         }
      }
   }

   resetReports () {
      for (let i = 0; i < this.hosts.length; i++) {
         this.nHostBytes[i] = 0;
         this.nHostMsgs[i] = 0;
         this.nHostClients[i] = 0;
         this.nReceived[i] = 0;
      }
   }
}
export { Sender, SenderParams };
