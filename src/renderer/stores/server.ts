import { defineStore } from 'pinia';
import * as Store from 'electron-store';

export interface ServerPort {
   enabled: boolean;
   port: number;
}

const persistentStore = new Store({ name: 'server' });

export const useServerStore = defineStore('server', {
   state: () => ({
      ports: persistentStore.get('ports', []) as ServerPort[]
   }),
   actions: {
      updatePorts (payload: ServerPort[]) {
         this.ports = payload;
         persistentStore.set('ports', this.ports);
      }
   }
});
