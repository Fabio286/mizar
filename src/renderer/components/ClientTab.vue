<template>
   <div class="flex box-100">
      <div id="client" class="box-50">
         <transition name="fade">
            <NewHost
               v-if="popNewHost"
               @hideAddHost="hideAddHost"
               @createHost="createHost"
            />
         </transition>
         <transition name="fade">
            <NewMessage
               v-if="popNewMessage"
               @hideAddMessage="hideAddMessage"
               @createMessage="createMessage"
            />
         </transition>
         <transition name="fade">
            <EditMessage
               v-if="popEditMessage"
               :message="localMessages[idEditedMsg]"
               :index="idEditedMsg"
               @hideEditMessage="hideEditMessage"
               @editMessage="editMessage"
            />
         </transition>
         <!-- <transition name="fade">
            <SaveConfig
               v-if="popSaveConfig"
               :params="params"
               @hideSaveConfig="hideSaveConfig"
               @saveConfig="saveConfig"
            />
         </transition>
         <transition name="fade">
            <LoadConfig
               v-if="popLoadConfig"
               @hideLoadConfig="hideLoadConfig"
               @loadConfig="loadConfig"
            />
         </transition> -->
         <form autocomplete="off" @submit.prevent="startTest">
            <fieldset :disabled="running !== 0">
               <Hosts
                  ref="hosts"
                  :host-list="localHosts"
                  @updateHosts="updateHosts"
                  @showAddHost="showAddHost"
                  @deleteHost="deleteHost"
                  @toggleHostCheck="toggleHostCheck"
               />
               <Messages
                  ref="messages"
                  :message-list="localMessages"
                  @updateMessages="updateMessages"
                  @showAddMessage="showAddMessage"
                  @showEditMessage="showEditMessage"
                  @deleteMessage="deleteMessage"
                  @toggleMessageCheck="toggleMessageCheck"
               />
               <div class="flex box-100">
                  <div class="input-element">
                     <label>Numero di Messaggi</label>
                     <input
                        v-model.number="params.nMsgs"
                        min="1"
                        step="1"
                        type="number"
                        required
                     >
                  </div>
                  <div class="input-element">
                     <label>Numero di Client</label>
                     <input
                        v-model.number="params.nClients"
                        min="1"
                        step="1"
                        type="number"
                        required
                     >
                  </div>
               </div>
               <div class="flex box-100">
                  <div class="input-element">
                     <label>Intervallo Minimo (ms)</label>
                     <input
                        v-model.number="params.tMin"
                        min="0"
                        step="1"
                        type="number"
                        required
                     >
                  </div>
                  <div class="input-element">
                     <label>Intervallo Massimo (ms)</label>
                     <input
                        v-model.number="params.tMax"
                        min="0"
                        step="1"
                        type="number"
                        required
                     >
                  </div>
               </div>
               <div class="flex box-100">
                  <div class="box-50">
                     <label class="checkbox">
                        <input
                           v-model="params.closeOnEcho"
                           type="checkbox"
                        >
                        <div class="checkbox-block" />
                        <span>Chiudi alla Risposta</span>
                     </label>
                     <label class="checkbox" title="Connessione Persistente">
                        <input
                           v-model="params.persistentConnection"
                           type="checkbox"
                        >
                        <div class="checkbox-block" />
                        <span>Conn. Persistente</span>
                     </label>
                     <label class="checkbox">
                        <input
                           v-model="params.stepTest"
                           type="checkbox"
                        >
                        <div class="checkbox-block" />
                        <span>Test a Step</span>
                     </label>
                  </div>
                  <div class="box-50">
                     <label class="checkbox">
                        <input
                           v-model="params.trace"
                           type="checkbox"
                        >
                        <div class="checkbox-block" />
                        <span>Abilita Trace</span>
                     </label>
                     <label class="checkbox">
                        <input
                           v-model="params.alertReset"
                           type="checkbox"
                        >
                        <div class="checkbox-block" />
                        <span>Allerta ECONNRESET</span>
                     </label>
                     <label class="checkbox" title="Ripete il test dopo il suo termine">
                        <input
                           v-model="params.loop"
                           type="checkbox"
                        >
                        <div class="checkbox-block" />
                        <span>Ripetizione Automatica</span>
                     </label>
                  </div>
               </div>
            </fieldset>
            <div class="buttons">
               <!-- <div class="button-wrap">
                  <i class="material-icons">get_app</i>
                  <button
                     class="save"
                     title="Carica configurazione"
                     :disabled="running !== 0"
                     @click.prevent="showLoadConfig"
                  >
                     Carica
                  </button>
               </div>
               <div class="button-wrap">
                  <i class="material-icons">save</i>
                  <button
                     class="save"
                     title="Salva configurazione corrente"
                     @click.prevent="showSaveConfig"
                  >
                     Salva
                  </button>
               </div> -->
               <div v-if="running === 0" class="button-wrap">
                  <i class="material-icons white">play_arrow</i>
                  <button class="confirm" type="submit">
                     Start
                  </button>
               </div>
               <div v-if="running !== 0 && params.stepTest" class="button-wrap">
                  <i class="material-icons white">message</i>
                  <button
                     class="confirm"
                     title="Invia Messaggi"
                     @click.prevent="sendMessages"
                  >
                     Invia
                  </button>
               </div>
               <div v-if="running !== 0" class="button-wrap">
                  <i class="material-icons white">stop</i>
                  <button class="stop" @click.prevent="stopTest">
                     Stop
                  </button>
               </div>
            </div>
         </form>
         <transition name="fade">
            <ClientTabReports
               v-if="reportList.length > 0"
               ref="reports"
               :reports="reportList"
            />
         </transition>
      </div><!-- /client -->
      <Console
         ref="console"
         :logs="slicedLogs"
      />
   </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import Console from './BaseConsole.vue';
import Hosts from './ClientTabHosts.vue';
import Messages from './ModalMessages.vue';
import NewHost from './ModalNewHost.vue';
import NewMessage from './ModalNewMessage.vue';
import EditMessage from './ModalEditMessage.vue';
// import SaveConfig from './ModalSaveConfig.vue';
// import LoadConfig from './ModalLoadConfig.vue';
import ClientTabReports from './ClientTabReports.vue';
import { ipcRenderer } from 'electron';
import { ClientHost, ClientMessage, useClientStore } from '@/stores/client';

const emit = defineEmits(['clientStatus']);

const clientStore = useClientStore();

const { hosts, messages } = storeToRefs(clientStore);
const { updateHosts: updateStoreHosts, updateMessages: updateStoreMessages } = clientStore;

const running = ref(0);
const params = ref({
   nMsgs: 1,
   nClients: 1,
   tMin: 0,
   tMax: 0,
   trace: false,
   alertReset: false,
   closeOnEcho: false,
   persistentConnection: false,
   stepTest: false,
   loop: false
});
const logs = ref([]);
const reportList = ref([]);
const popNewHost = ref(false);
const popNewMessage = ref(false);
const popEditMessage = ref(false);
// const popSaveConfig = ref(false);
// const popLoadConfig = ref(false);
const idEditedMsg = ref(null);
const localHosts = ref(hosts.value);
const localMessages = ref(messages.value);

const slicedLogs = computed(() => {
   if (logs.value.length > 500)
      logs.value = logs.value.slice(-500);

   return logs.value;
});

const startTest = () => {
   if (params.value.tMin < 100 && params.value.trace === true) {
      params.value.trace = false;
      const time = new Date().toLocaleString();
      const log = {
         time: time,
         message: 'Trace disabilitato: Intervalli troppo brevi',
         color: 'yellow'
      };

      logs.value.push(log);
   }

   running.value = 1;
   emit('clientStatus', running.value);

   if (params.value.stepTest) {
      params.value.closeOnEcho = false;
      params.value.persistentConnection = false;
      params.value.loop = false;
   }

   const obj = {
      params: params.value,
      hosts: localHosts.value.filter((host) => {
         return host.enabled === true;
      })
   };
   ipcRenderer.send('startTest', obj);
};

const sendMessages = () => {
   ipcRenderer.send('sendMessages');
};

const stopTest = () => {
   ipcRenderer.send('stopTest');
};

// Host
const createHost = (host: ClientHost) => {
   popNewHost.value = false;
   localHosts.value = [...localHosts.value, host];
   updateStoreHosts(localHosts.value);
};

const showAddHost = () => {
   popNewHost.value = true;
};

const hideAddHost = () => {
   popNewHost.value = false;
};

const updateHosts = () => {
   updateStoreHosts(localHosts.value);
};

const deleteHost = (hostId: number) => {
   localHosts.value.splice(hostId, 1);
   updateStoreHosts(localHosts.value);
};

const toggleHostCheck = (status: number) => {
   if (running.value !== 0) return;
   const enable = status === 0;
   localHosts.value.forEach((host) => {
      host.enabled = enable;
   });
   updateStoreHosts(localHosts.value);
};

// Messaggi
const createMessage = (message: ClientMessage) => {
   localMessages.value.push(message);
   popNewMessage.value = false;
   updateStoreMessages(localMessages.value);
};

const editMessage = (message: ClientMessage, index: number) => {
   popEditMessage.value = false;
   localMessages.value[index] = message;
   updateStoreMessages(localMessages.value);
};

const updateMessages = () => {
   updateStoreMessages(localMessages.value);
};

const showAddMessage = () => {
   popNewMessage.value = true;
};

const hideAddMessage = () => {
   popNewMessage.value = false;
};

const showEditMessage = (index: number) => {
   idEditedMsg.value = index;
   popEditMessage.value = true;
};

const hideEditMessage = () => {
   popEditMessage.value = false;
};

const deleteMessage = (messageId: number) => {
   localMessages.value.splice(messageId, 1);
   updateStoreMessages(localMessages.value);
};

const toggleMessageCheck = (status: number) => {
   if (running.value !== 0) return;
   const enable = status === 0;
   localMessages.value.forEach((message) => {
      message.enabled = enable;
   });
   updateStoreMessages(localMessages.value);
};
ipcRenderer.on('clientLog', (event, data) => {
   const time = new Date().toLocaleString();
   const { message, color } = data;
   const log = {
      time: time,
      message,
      color
   };

   logs.value.push(log);
});

ipcRenderer.on('testFinish', (event, message) => {
   running.value = 0;
   emit('clientStatus', running.value);
   const time = new Date().toLocaleString();
   const log = {
      time: time,
      message,
      color: ''
   };

   logs.value.push(log);
});

// ipcRenderer.send('getHosts');
// ipcRenderer.on('hosts', (event, hosts) => {
//    hosts.value = hosts;
// });

// ipcRenderer.send('getMessages');
// ipcRenderer.on('localMessages', (event, messages) => {
//    localMessages.value = messages;
// });

ipcRenderer.on('reportClientList', (event, reports) => {
   reportList.value = reports;
});
</script>
