import { defineStore } from 'pinia';
import * as ElectronStore from 'electron-store';
import { ClientHost, ClientMessage } from 'common/interfaces';

const persistentStore = new ElectronStore({ name: 'client' });

export const useClientStore = defineStore('client', {
   state: () => ({
      hosts: persistentStore.get('hosts', [{
         enabled: true,
         host: 'localhost',
         port: 8080
      }]) as ClientHost[],
      messages: persistentStore.get('messages', [{
         enabled: true,
         format: 'utf-8',
         message: 'Hello, World!',
         name: 'Hello, World!'
      }]) as ClientMessage[]
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
