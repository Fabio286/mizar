import { defineStore } from 'pinia';
import * as Store from 'electron-store';

export interface ClientHost {
   enabled: boolean;
   host: string;
   port: number;
}

export interface ClientMessage {
   enabled: boolean;
   format: 'hex' | 'ascii';
   message: string;
   name: string;
}

const persistentStore = new Store({ name: 'client' });

export const useClientStore = defineStore('client', {
   state: () => ({
      hosts: persistentStore.get('hosts', []) as ClientHost[],
      messages: persistentStore.get('messages', []) as ClientMessage[]
   }),
   actions: {
      updateHosts (payload: ClientHost[]) {
         this.hosts = payload;
         persistentStore.set('hosts', this.hosts);
      },
      updateMessages (payload: ClientMessage[]) {
         this.messages = payload;
         persistentStore.set('messages', this.messages);
      }
   }
});
