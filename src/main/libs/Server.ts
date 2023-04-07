import { ServerPort } from 'common/interfaces';
import * as net from 'net';

interface ServerParams {
   trace: boolean;
   echo: boolean;
   alertReset: boolean;
 }

class Server {
   private process: NodeJS.Process;
   private trace: boolean;
   private echo: boolean;
   private alertReset: boolean;
   private ports: ServerPort[];
   private server: net.Server[];
   private nBytes: number[];
   private nMsgs: number[];

   constructor (process: NodeJS.Process) {
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
   setPorts (ports: ServerPort[]) {
      this.ports = ports;
   }

   /**
    * Invia i log al render process
    *
    * @param {string} message Messaggio del log
    * @param {string} [color=''] Colore del log (green, yellow, red)
    * @memberof Server
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

   startServer (params: ServerParams) {
      this.trace = params.trace;
      this.echo = params.echo;
      this.alertReset = params.alertReset;

      for (let i = 0; i < this.ports.length; i++) {
         const port = this.ports[i].port;

         this.server[i] = net.createServer();
         this.nBytes[i] = 0;
         this.nMsgs[i] = 0;

         this.server[i].on('connection', (socket: net.Socket) => {
            if (this.trace)
               this.sendLog(null, '', 'clientConnectedOnPort', { port });

            socket.on('data', (msg: Buffer) => {
               const msgString = msg.toString();
               if (this.echo) socket.write(msg);
               this.nBytes[i] += msg.length;
               this.nMsgs[i]++;

               if (this.trace)
                  this.sendLog(null, '', 'messageReceivedOnPort', { port, message: msgString });
            });// <- socket data

            socket.on('end', () => {
               if (this.trace)
                  this.sendLog(null, '', 'clientDisonnectedOnPort', { port });
            });

            socket.on('error', (err: Error & { code: string }) => {
               switch (err.code) {
                  case 'ECONNRESET':
                     if (this.alertReset)
                        this.sendLog(null, 'yellow', 'clientErrorOnPort', { port, error: err.toString() });
                     else
                     if (this.trace)
                        this.sendLog(null, '', 'clientDisonnectedOnPort', { port });
                     break;
                  default:
                     this.sendLog(null, 'red', 'clientErrorOnPort', { port, error: err.toString() });
               }
            });
         });// <- server

         this.server[i].on('error', (err: Error) => {
            this.sendLog(null, 'red', 'serverErrorOnPort', { port, error: err.toString() });
         });

         this.server[i].listen(port, () => {
            this.sendLog(null, '', 'listenindOnPort', { port });
         });
      }
   }

   stopServer (callback: () => void) {
      (async () => {
         for (let i = 0; i < this.server.length; i++) {
            this.server[i].close(() => {
               this.server[i].unref();
            });
         }
         callback();
      })();
   }

   getReports () {
      const reportList: {port: number; sockets: number; data: number; messages: number}[] = [];
      for (let i = 0; i < this.server.length; i++) {
         const report = {
            port: (this.server[i].address() as net.AddressInfo).port,
            sockets: null as number,
            data: this.nBytes[i],
            messages: this.nMsgs[i]
         };

         this.server[i].getConnections((err: Error, nSockets: number) => {
            if (err)
               this.sendLog(null, 'red', 'reportError', { error: err.toString() });
            report.sockets = nSockets;
            reportList.push(report);

            if ((i + 1) === this.server.length) {
               const rep = {
                  event: 'report',
                  content: reportList
               };
               this.process.send(rep);
            }
         });
      }
   }

   resetReports () {
      for (let i = 0; i < this.server.length; i++) {
         this.nBytes[i] = 0;
         this.nMsgs[i] = 0;
      }
   }
}
export { Server, ServerParams };
