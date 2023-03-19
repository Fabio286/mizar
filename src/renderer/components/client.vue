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
            <client-reports
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

<script>
import Console from './console.vue';
import Hosts from './hosts.vue';
import Messages from './messages.vue';
import NewHost from './new-host.vue';
import NewMessage from './new-message.vue';
import EditMessage from './edit-message.vue';
import SaveConfig from './save-config.vue';
import LoadConfig from './load-config.vue';
import ClientReports from './client-reports.vue';
import { ipcRenderer } from 'electron';

export default {
   name: 'Client',
   components: {
      Console,
      Hosts,
      Messages,
      NewHost,
      NewMessage,
      EditMessage,
      SaveConfig,
      LoadConfig,
      ClientReports
   },
   data () {
      return {
         running: 0,
         params: {
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
         },
         logs: [],
         hostList: [],
         messageList: [],
         reportList: [],
         popNewHost: false,
         popNewMessage: false,
         popEditMessage: false,
         popSaveConfig: false,
         popLoadConfig: false,
         idEditedMsg: null
      };
   },
   computed: {
      slicedLogs () {
         if (this.logs.length > 500)
            this.logs = this.logs.slice(-500);

         return this.logs;
      }
   },
   created () {
      ipcRenderer.on('clientLog', (event, data) => {
         let time = new Date().toLocaleString();
         let { message, color } = data;
         let log = {
            time: time,
            message,
            color
         };

         this.logs.push(log);
      });

      ipcRenderer.on('testFinish', (event, message) => {
         this.running = 0;
         this.$emit('clientStatus', this.running);
         let time = new Date().toLocaleString();
         let log = {
            time: time,
            message,
            color: ''
         };

         this.logs.push(log);
      });

      ipcRenderer.send('getHosts');
      ipcRenderer.on('hostList', (event, hosts) => {
         this.hostList = hosts;
      });

      ipcRenderer.send('getMessages');
      ipcRenderer.on('messageList', (event, messages) => {
         this.messageList = messages;
      });

      ipcRenderer.on('reportClientList', (event, reports) => {
         this.reportList = reports;
      });
   },
   methods: {
      startTest () {
         if (this.params.tMin < 100 && this.params.trace === true) {
            this.params.trace = false;
            let time = new Date().toLocaleString();
            let log = {
               time: time,
               message: 'Trace disabilitato: Intervalli troppo brevi',
               color: 'yellow'
            };

            this.logs.push(log);
         }

         this.running = 1;
         this.$emit('clientStatus', this.running);

         if (this.params.stepTest) {
            this.params.closeOnEcho = false;
            this.params.persistentConnection = false;
            this.params.loop = false;
         }

         let obj = {
            params: this.params,
            hosts: this.hostList.filter((host) => {
               return host.enabled === true;
            })
         };
         ipcRenderer.send('startTest', obj);
      },
      sendMessages () {
         ipcRenderer.send('sendMessages');
      },
      stopTest () {
         ipcRenderer.send('stopTest');
      },

      // Host
      createHost (host) {
         this.hostList.push(host);
         this.popNewHost = false;
         ipcRenderer.send('updateHosts', this.hostList);
      },
      showAddHost () {
         this.popNewHost = true;
      },
      hideAddHost () {
         this.popNewHost = false;
      },
      updateHosts () {
         ipcRenderer.send('updateHosts', this.hostList);
      },
      deleteHost (hostId) {
         this.hostList.splice(hostId, 1);
         ipcRenderer.send('updateHosts', this.hostList);
      },
      toggleHostCheck (status) {
         if (this.running !== 0) return;
         let enable = status === 0;
         this.hostList.forEach((host) => {
            host.enabled = enable;
         });
         ipcRenderer.send('updateHosts', this.hostList);
      },

      // Messaggi
      createMessage (message) {
         this.messageList.push(message);
         this.popNewMessage = false;
         ipcRenderer.send('updateMessages', this.messageList);
      },
      editMessage (message, index) {
         this.popEditMessage = false;
         this.$set(this.messageList, index, message);
         ipcRenderer.send('updateMessages', this.messageList);
      },
      updateMessages () {
         ipcRenderer.send('updateMessages', this.messageList);
      },
      showAddMessage () {
         this.popNewMessage = true;
      },
      hideAddMessage () {
         this.popNewMessage = false;
      },
      showEditMessage (index) {
         this.idEditedMsg = index;
         this.popEditMessage = true;
      },
      hideEditMessage () {
         this.popEditMessage = false;
      },
      deleteMessage (messageId) {
         this.messageList.splice(messageId, 1);
         ipcRenderer.send('updateMessages', this.messageList);
      },
      toggleMessageCheck (status) {
         if (this.running !== 0) return;
         let enable = status === 0;
         this.messageList.forEach((message) => {
            message.enabled = enable;
         });
         ipcRenderer.send('updateMessages', this.messageList);
      },

      // Convigurazioni
      showSaveConfig () {
         this.popSaveConfig = true;
      },
      hideSaveConfig () {
         this.popSaveConfig = false;
      },
      saveConfig (config) {
         this.popSaveConfig = false;
         ipcRenderer.send('saveClientConfig', config);
      },

      showLoadConfig () {
         this.popLoadConfig = true;
      },
      hideLoadConfig () {
         this.popLoadConfig = false;
      },
      loadConfig (config) {
         this.popLoadConfig = false;
         this.params = config.params;

         let time = new Date().toLocaleString();
         let log = {
            time: time,
            message: `Configurazione "${config.name}" ripristinata`,
            color: 'green'
         };

         this.logs.push(log);
      }
   }
};
</script>
