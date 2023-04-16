import { ClientHost, ClientMessage } from 'common/interfaces';
import { Sender, SenderParams } from '../libs/Sender';

const sender = new Sender(process);
let clientTimer: NodeJS.Timer;

process.on('message', (message: { event: string; hosts: ClientHost[]; messages: ClientMessage[]; params: SenderParams}) => {
   switch (message.event) {
      case 'start':
         sender.setHosts(message.hosts);
         sender.setMessages(message.messages);
         sender.setParams(message.params);

         sender.startFullTest(() => {
            const response = {
               event: 'finish',
               content: 'testEnded'
            };
            process.send(response);
            if (clientTimer !== undefined) clearInterval(clientTimer);
            sender.getReports();
         });

         sender.getReports();

         if (clientTimer === undefined) {
            clientTimer = setInterval(() => {
               sender.getReports();
            }, 200);
         }
         break;
      case 'startStep':
         sender.setHosts(message.hosts);
         sender.setMessages(message.messages);
         sender.setParams(message.params);

         sender.connectClients(() => {
            const response = {
               event: 'log',
               content: { i18n: 'clientsConnected', color: '' }
            };
            process.send(response);
         });

         sender.getReports();

         if (clientTimer === undefined) {
            clientTimer = setInterval(() => {
               sender.getReports();
            }, 200);
         }
         break;
      case 'sendStep':
         sender.sendMessages(() => {
            const response = {
               event: 'log',
               content: { i18n: 'messagesSent', color: '' }
            };
            process.send(response);
         });
         break;
      case 'stop':
         sender.stopClients(() => {
            if (clientTimer !== undefined) clearInterval(clientTimer);
            sender.getReports();
            process.exit();
         });
         break;
   }
});
