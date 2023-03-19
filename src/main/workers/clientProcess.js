const Sender = require('../classes/Sender');
Sends = new Sender(process);
let interval = null;

process.on('message', message => {
   switch (message.event) {
      case 'start':
         Sends.setHosts(message.hosts);
         Sends.setParams(message.params);
         Sends.setStoragePath(message.storagePath);

         Sends.startFullTest(() => {
            let response = {
               event: 'finish',
               content: 'Test concluso'
            };
            process.send(response);
            if (interval !== null) clearInterval(interval);
            Sends.getReports();
         });

         Sends.getReports();

         if (interval === null) {
            interval = setInterval(() => {
               Sends.getReports();
            }, 200);
         }
         break;
      case 'startStep':
         Sends.setHosts(message.hosts);
         Sends.setParams(message.params);
         Sends.setStoragePath(message.storagePath);

         Sends.connectClients(() => {
            let response = {
               event: 'log',
               content: { message: 'Client connessi', color: '' }
            };
            process.send(response);
         });

         Sends.getReports();

         if (interval === null) {
            interval = setInterval(() => {
               Sends.getReports();
            }, 200);
         }
         break;
      case 'sendStep':
         Sends.sendMessages(() => {
            let response = {
               event: 'log',
               content: { message: 'Messaggi inviati', color: '' }
            };
            process.send(response);
         });
         break;
      case 'stop':
         Sends.stopClients(() => {
            if (interval !== null) clearInterval(interval);
            Sends.getReports();
            process.exit();
         });
         break;
   }
});
