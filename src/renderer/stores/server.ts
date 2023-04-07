import { defineStore } from 'pinia';
import * as ElectronStore from 'electron-store';
import { ServerPort } from 'common/interfaces';

const persistentStore = new ElectronStore({ name: 'server' });

export const useServerStore = defineStore('server', {
   state: () => ({
      ports: persistentStore.get('ports', [{
         enabled: true,
         port: 8080
      }]) as ServerPort[]
   }),
   actions: {
      updatePorts (payload: ServerPort[]) {
         this.ports = payload;
         persistentStore.set('ports', this.ports);
      }
   }
});
