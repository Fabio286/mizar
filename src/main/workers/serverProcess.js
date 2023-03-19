const Server = require('../classes/Server');
myServer = new Server(process);
let interval = null;

process.on('message', message => {
   switch (message.event) {
      case 'start':
         myServer.setPorts(message.ports);
         myServer.startServer(message.params);

         if (interval === null) {
            interval = setInterval(() => {
               myServer.getReports();
            }, 200);
         }
         break;
      case 'stop':
         myServer.stopServer(() => {
            if (interval !== null) clearInterval(interval);
            process.exit();
         });
         break;
      case 'reset':
         myServer.resetReports();
         break;
   }
});
