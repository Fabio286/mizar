import { ServerPort } from 'common/interfaces';
import * as net from 'net';

class Server {
   process: NodeJS.Process;
   trace: boolean;
   echo: boolean;
   alertReset: boolean;
   ports: ServerPort[];
   server: any[];
   nBytes: any[];
   nMsgs: any[];

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
   setPorts (ports: any) {
      this.ports = ports;
   }

   /**
    * Invia i log al render process
    *
    * @param {string} message Messaggio del log
    * @param {string} [color=''] Colore del log (green, yellow, red)
    * @memberof Server
    */
   sendLog (message: string, color = '') {
      const log = {
         event: 'log',
         content: { message, color }
      };
      this.process.send(log);
   }

   startServer (params: any) {
      this.trace = params.trace;
      this.echo = params.echo;
      this.alertReset = params.alertReset;

      for (let i = 0; i < this.ports.length; i++) {
         const port = this.ports[i].port;

         this.server[i] = net.createServer();
         this.nBytes[i] = 0;
         this.nMsgs[i] = 0;

         this.server[i].on('connection', (socket: any) => {
            if (this.trace) this.sendLog(`Client connesso su porta ${port}`);

            socket.on('data', (msg: any) => {
               const msgString = msg.toString();
               if (this.echo) socket.write(msg);
               this.nBytes[i] += msg.length;
               this.nMsgs[i]++;

               if (this.trace) this.sendLog(`Messaggio ricevuto su porta ${port}: ${msgString}`);
            });// <- socket data

            socket.on('end', () => {
               if (this.trace) this.sendLog(`Client disconnesso su porta ${port}`);
            });

            socket.on('error', (err: any) => {
               switch (err.code) {
                  case 'ECONNRESET':
                     if (this.alertReset)
                        this.sendLog(`Errore client su porta ${port}: \n${err}`, 'yellow');
                     else
                     if (this.trace) this.sendLog(`Client disconnesso su porta ${port}`);
                     break;
                  default:
                     this.sendLog(`Errore client su porta ${port}: \n${err}`, 'red');
               }
            });
         });// <- server

         this.server[i].on('error', (err: any) => {
            this.sendLog(`Errore server su porta ${port}: \n${err}`, 'red');
         });

         this.server[i].listen(port, () => {
            this.sendLog(`In ascolto sulla porta ${port}`);
         });
      }
   }

   stopServer (callback: () => void) {
      (async () => {
         for (let i = 0; i < this.server.length; i++) {
            await this.server[i].close(function () {
               this.server[i].unref();
            });
         }
         callback();
      })();
   }

   getReports () {
      const reportList: any[] = [];
      for (let i = 0; i < this.server.length; i++) {
         const report = {
            port: this.server[i].address().port,
            sockets: null as any,
            data: this.nBytes[i],
            messages: this.nMsgs[i]
         };

         this.server[i].getConnections((err: any, nSockets: any) => {
            if (err) this.sendLog(`Errore report: \n${err}`, 'red');
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
export { Server };
