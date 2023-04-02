import { defineStore } from 'pinia';
import * as ElectronStore from 'electron-store';
import { ClientHost, ClientMessage } from 'common/interfaces';

const persistentStore = new ElectronStore({ name: 'client' });

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
