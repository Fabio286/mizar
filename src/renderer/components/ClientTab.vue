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
               :message="messageList[idEditedMsg]"
               :index="idEditedMsg"
               @hideEditMessage="hideEditMessage"
               @editMessage="editMessage"
            />
         </transition>
         <transition name="fade">
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
         </transition>
         <form autocomplete="off" @submit.prevent="startTest">
            <fieldset :disabled="running !== 0">
               <Hosts
                  ref="hosts"
                  :host-list="hostList"
                  @updateHosts="updateHosts"
                  @showAddHost="showAddHost"
                  @deleteHost="deleteHost"
                  @toggleHostCheck="toggleHostCheck"
               />
               <Messages
                  ref="messages"
                  :message-list="messageList"
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
               <div class="button-wrap">
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
               </div>
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
import Console from './BaseConsole.vue';
import Hosts from './ClientTabHosts.vue';
import Messages from './ModalMessages.vue';
import NewHost from './ModalNewHost.vue';
import NewMessage from './ModalNewMessage.vue';
import EditMessage from './ModalEditMessage.vue';
import SaveConfig from './ModalSaveConfig.vue';
import LoadConfig from './ModalLoadConfig.vue';
import ClientTabReports from './ClientTabReports.vue';
import { ipcRenderer } from 'electron';

const emit = defineEmits(['clientStatus']);

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
const hostList = ref([]);
const messageList = ref([]);
const reportList = ref([]);
const popNewHost = ref(false);
const popNewMessage = ref(false);
const popEditMessage = ref(false);
const popSaveConfig = ref(false);
const popLoadConfig = ref(false);
const idEditedMsg = ref(null);

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
      hosts: hostList.value.filter((host) => {
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
const createHost = (host: string) => {
   hostList.value.push(host);
   popNewHost.value = false;
   ipcRenderer.send('updateHosts', hostList.value);
};

const showAddHost = () => {
   popNewHost.value = true;
};

const hideAddHost = () => {
   popNewHost.value = false;
};

const updateHosts = () => {
   ipcRenderer.send('updateHosts', hostList.value);
};

const deleteHost = (hostId: number) => {
   hostList.value.splice(hostId, 1);
   ipcRenderer.send('updateHosts', hostList.value);
};

const toggleHostCheck = (status: number) => {
   if (running.value !== 0) return;
   const enable = status === 0;
   hostList.value.forEach((host) => {
      host.enabled = enable;
   });
   ipcRenderer.send('updateHosts', hostList.value);
};

// Messaggi
const createMessage = (message: any) => {
   messageList.value.push(message);
   popNewMessage.value = false;
   ipcRenderer.send('updateMessages', messageList.value);
};

const editMessage = (message: any, index: number) => {
   popEditMessage.value = false;
   messageList.value[index] = message;
   ipcRenderer.send('updateMessages', messageList.value);
};

const updateMessages = () => {
   ipcRenderer.send('updateMessages', messageList.value);
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
   messageList.value.splice(messageId, 1);
   ipcRenderer.send('updateMessages', messageList.value);
};

const toggleMessageCheck = (status: number) => {
   if (running.value !== 0) return;
   const enable = status === 0;
   messageList.value.forEach((message) => {
      message.enabled = enable;
   });
   ipcRenderer.send('updateMessages', messageList.value);
};

// Convigurazioni
const showSaveConfig = () => {
   popSaveConfig.value = true;
};

const hideSaveConfig = () => {
   popSaveConfig.value = false;
};

const saveConfig = (config: any) => {
   popSaveConfig.value = false;
   ipcRenderer.send('saveClientConfig', config);
};

const showLoadConfig = () => {
   popLoadConfig.value = true;
};

const hideLoadConfig = () => {
   popLoadConfig.value = false;
};

const loadConfig = (config: any) => {
   popLoadConfig.value = false;
   params.value = config.params;

   const time = new Date().toLocaleString();
   const log = {
      time: time,
      message: `Configurazione "${config.name}" ripristinata`,
      color: 'green'
   };

   logs.value.push(log);
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

ipcRenderer.send('getHosts');
ipcRenderer.on('hostList', (event, hosts) => {
   hostList.value = hosts;
});

ipcRenderer.send('getMessages');
ipcRenderer.on('messageList', (event, messages) => {
   messageList.value = messages;
});

ipcRenderer.on('reportClientList', (event, reports) => {
   reportList.value = reports;
});
</script>
