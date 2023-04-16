import * as net from 'net';
import { ClientHost, ClientMessage } from 'common/interfaces';

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
   messages: ClientMessage[];
}

class Sender {
   private process: NodeJS.Process;
   private closeOnEcho: boolean;
   private persistentConnection: boolean;
   private nMsgs: number;
   private tMin: number;
   private tMax: number;
   private nClients: number;
   private trace: boolean;
   private alertReset: boolean;
   private hexMsg: boolean;
   private nConnected: number;
   private nClosed: number;
   private nTryConnect: number;
   private nReceived: number[];
   private nSent: number;
   private timeStart: Date;
   private hosts: ClientHost[];
   private messages: ClientMessage[];
   private nHostClients: number[];
   private nHostBytes: number[];
   private nHostMsgs: number[];
   private loop: boolean;

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
    * Setta gli hosts
    *
    * @param {*} messages
    * @memberof Sender
    */
   setMessages (messages: ClientMessage[]) {
      this.messages = messages;
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
      if (this.trace)
         this.sendLog(null, '', 'messagesLoaded', { mNumber: this.messages.length });
   }

   /**
    * Invia i log al render process
    *
    * @param {string} message Messaggio del log
    * @param {string} [color=''] Colore del log (green, yellow, red)
    * @memberof Sender
    */
   sendLog (message?: string, color = '', i18n?: string, i18nParams?: {[key: string]: string | number}) {
      const log = {
         event: 'log',
         content: {
            message,
            color,
            i18n,
            params: i18nParams
         }
      };
      this.process.send(log);
   }

   /** Restituisce un messaggio casuale */
   randMsg () {
      if (this.messages.length > 0) {
         const index = Math.floor((Math.random() * (this.messages.length)));
         let msg;

         switch (this.messages[index].format) {
            case 'utf-8':
               msg = Buffer.from(this.messages[index].message, 'utf-8');
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
      else return '';
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
               this.nTryConnect++;

               client.connect(params, () => {
                  if (this.trace)
                     this.sendLog(null, '', 'socketOpen', { number: clientId, host: params.host, port: params.port });
                  this.nHostClients[x]++;

                  (async () => {
                     for (let i = 0; i < this.nMsgs; i++) { // msg for
                        await delay();

                        const msg = this.randMsg();

                        client.write(msg, (err: Error) => {
                           if (err)
                              this.sendLog(null, 'red', 'logOnSocket', { number: clientId, host: params.host, port: params.port, message: err.toString() });
                           else {
                              this.nSent++;
                              this.nHostMsgs[x]++;
                              this.nHostBytes[x] += msg.length;
                           }
                        });

                        if (this.trace) this.sendLog(null, '', 'socketMessage', { number: clientId, host: params.host, port: params.port, mNumber: i + 1 });
                        if (i + 1 === this.nMsgs && !this.closeOnEcho && !this.persistentConnection) client.end();
                     }// <- msg for
                  })();
               });
            }
            catch (err) {
               this.sendLog(null, 'red', 'logOnSocket', { number: clientId, host: params.host, port: params.port, message: err.toString() });
            }

            client.on('connect', (err: Error) => {
               if (err)
                  this.sendLog(null, 'red', 'logOnSocket', { number: clientId, host: params.host, port: params.port, message: err.toString() });
               else
                  this.nConnected++;
                  // if (this.nConnected === (this.nClients * this.hosts.length)) this.getReport();
            });

            client.on('data', (data: Buffer) => {
               this.nReceived[x]++;
               if (this.closeOnEcho)
                  client.end();

               if (this.trace)
                  this.sendLog(null, '', 'socketReply', { number: clientId, host: params.host, port: params.port, reply: data.toString() });
            });

            client.on('close', () => {
               this.nClosed++;
               if (this.trace)
                  this.sendLog(null, '', 'socketClosed', { number: clientId, host: params.host, port: params.port });

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
                        this.sendLog(null, 'yellow', 'logOnSocket', { number: clientId, host: params.host, port: params.port, message: err.toString() });
                     break;
                  default:
                     this.sendLog(null, 'red', 'logOnSocket', { number: clientId, host: params.host, port: params.port, message: err.toString() });
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
               this.nTryConnect++;

               client.connect(params, () => {
                  if (this.trace) this.sendLog(null, '', 'socketOpen', { number: clientId, host: params.host, port: params.port });
                  this.nHostClients[x]++;
               });
            }
            catch (err) {
               this.sendLog(null, 'red', 'logOnSocket', { number: clientId, host: params.host, port: params.port, message: err.toString() });
            }

            client.on('connect', (err: Error) => {
               if (err)
                  this.sendLog(null, 'red', 'logOnSocket', { number: clientId, host: params.host, port: params.port, message: err.toString() });
               else
                  this.nConnected++;
                  // if (this.nConnected === (this.nClients * this.hosts.length)) this.getReport();

               if ((this.nClients * this.hosts.length) === this.nTryConnect) callback();
            });

            client.on('data', (data: Buffer) => {
               this.nReceived[x]++;
               if (this.closeOnEcho)
                  client.end();

               if (this.trace)
                  this.sendLog(null, '', 'socketReply', { number: clientId, host: params.host, port: params.port, reply: data.toString() });
            });

            client.on('close', () => {
               this.nClosed++;
               if (this.trace)
                  this.sendLog(null, '', 'socketClosed', { number: clientId, host: params.host, port: params.port });
            });

            client.on('error', (err: Error & { code: string }) => {
               switch (err.code) {
                  case 'ECONNRESET':
                     if (this.alertReset)
                        this.sendLog(null, 'yellow', 'logOnSocket', { number: clientId, host: params.host, port: params.port, message: err.toString() });
                     break;
                  default:
                     this.sendLog(null, 'red', 'logOnSocket', { number: clientId, host: params.host, port: params.port, message: err.toString() });
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
      const delay = () => {
         const wait = Math.floor((Math.random() * this.tMax) + this.tMin);
         return new Promise(resolve => setTimeout(resolve, wait));
      };

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
                        this.sendLog(null, 'red', 'logOnSocket', { number: clientId, host: params.host, port: params.port, error: err.toString() });
                     else {
                        this.nSent++;
                        this.nHostMsgs[x]++;
                        this.nHostBytes[x] += msg.length;
                        if ((this.nMsgs * this.hosts.length * this.nClients) === this.nSent) callback();
                     }
                  });

                  if (this.trace) this.sendLog(null, '', 'socketMessage', { number: clientId, host: params.host, port: params.port, mNumber: i + 1 });
               }// <- msg for
            })();
         }// <- clients for
      }// <- hosts for
   }

   /** Genera il report su console */
   getConsoleReports () {
      const end = Number(new Date()) - Number(this.timeStart);
      const i18n = 'testDuration';

      this.sendLog(null, 'green', i18n, { ms: end });
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
