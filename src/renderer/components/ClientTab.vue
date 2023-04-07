<template>
   <div class="flex box-100">
      <div id="client" class="box-50">
         <transition name="fade">
            <NewHost
               v-if="popNewHost"
               @hide-add-host="hideAddHost"
               @create-host="createHost"
            />
         </transition>
         <transition name="fade">
            <NewMessage
               v-if="popNewMessage"
               @hide-add-message="hideAddMessage"
               @create-message="createMessage"
            />
         </transition>
         <transition name="fade">
            <EditMessage
               v-if="popEditMessage"
               :message="localMessages[idEditedMsg]"
               :index="idEditedMsg"
               @hide-edit-message="hideEditMessage"
               @edit-message="editMessage"
            />
         </transition>
         <form autocomplete="off" @submit.prevent="startTest">
            <fieldset :disabled="running !== 0">
               <Hosts
                  ref="hosts"
                  :host-list="localHosts"
                  @update-hosts="updateHosts"
                  @show-add-host="showAddHost"
                  @delete-host="deleteHost"
                  @toggle-host-check="toggleHostCheck"
               />
               <Messages
                  ref="messages"
                  :message-list="localMessages"
                  @update-messages="updateMessages"
                  @show-add-message="showAddMessage"
                  @show-edit-message="showEditMessage"
                  @delete-message="deleteMessage"
                  @toggle-message-check="toggleMessageCheck"
               />
               <div class="flex box-100">
                  <div class="input-element">
                     <label>{{ t('message.numberOfMessages') }}</label>
                     <input
                        v-model.number="params.nMsgs"
                        min="1"
                        step="1"
                        type="number"
                        required
                     >
                  </div>
                  <div class="input-element">
                     <label>{{ t('message.numberOfClients') }}</label>
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
                     <label>{{ t('message.minInterval') }}</label>
                     <input
                        v-model.number="params.tMin"
                        min="0"
                        step="1"
                        type="number"
                        required
                     >
                  </div>
                  <div class="input-element">
                     <label>{{ t('message.maxInterval') }}</label>
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
                        <span>{{ t('message.closeOnReply') }}</span>
                     </label>
                     <label class="checkbox">
                        <input
                           v-model="params.persistentConnection"
                           type="checkbox"
                        >
                        <div class="checkbox-block" />
                        <span>{{ t('message.persistentConnection') }}</span>
                     </label>
                     <label class="checkbox">
                        <input
                           v-model="params.stepTest"
                           type="checkbox"
                        >
                        <div class="checkbox-block" />
                        <span>{{ t('message.steptest') }}</span>
                     </label>
                  </div>
                  <div class="box-50">
                     <label class="checkbox">
                        <input
                           v-model="params.trace"
                           type="checkbox"
                        >
                        <div class="checkbox-block" />
                        <span>{{ t('message.enableTrace') }}</span>
                     </label>
                     <label class="checkbox">
                        <input
                           v-model="params.alertReset"
                           type="checkbox"
                        >
                        <div class="checkbox-block" />
                        <span>{{ t('message.alertEconnreset') }}</span>
                     </label>
                     <label class="checkbox" :title="t('message.loopModeEsplaination')">
                        <input
                           v-model="params.loop"
                           type="checkbox"
                        >
                        <div class="checkbox-block" />
                        <span>{{ t('message.loopMode') }}</span>
                     </label>
                  </div>
               </div>
            </fieldset>
            <div class="buttons">
               <div v-if="running === 0" class="button-wrap">
                  <i class="material-icons white">play_arrow</i>
                  <button class="confirm" type="submit">
                     {{ t('word.start') }}
                  </button>
               </div>
               <div v-if="running !== 0 && params.stepTest" class="button-wrap">
                  <i class="material-icons white">message</i>
                  <button
                     class="confirm"
                     :title="t('message.sendMessages')"
                     @click.prevent="sendMessages"
                  >
                     {{ t('word.send') }}
                  </button>
               </div>
               <div v-if="running !== 0" class="button-wrap">
                  <i class="material-icons white">stop</i>
                  <button class="stop" @click.prevent="stopTest">
                     {{ t('word.stop') }}
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
      </div>
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
import Messages from './ClientMessages.vue';
import NewHost from './ModalNewHost.vue';
import NewMessage from './ModalNewMessage.vue';
import EditMessage from './ModalEditMessage.vue';
import ClientTabReports from './ClientTabReports.vue';
import { ipcRenderer } from 'electron';
import { useClientStore } from '@/stores/client';
import { unproxify } from '../libs/unproxify';
import { ClientHost, ClientMessage } from 'common/interfaces';
import { useI18n } from 'vue-i18n';

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
const idEditedMsg = ref(null);
const localHosts = ref(hosts.value);
const localMessages = ref(messages.value);

const { t } = useI18n();

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
         i18n: 'tracesDisabledMessage',
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
      }),
      messages: localMessages.value.filter((message) => {
         return message.enabled === true;
      })
   };
   ipcRenderer.send('start-test', unproxify(obj));
};

const sendMessages = () => {
   ipcRenderer.send('send-messages');
};

const stopTest = () => {
   ipcRenderer.send('stop-test');
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
ipcRenderer.on('client-log', (event, data) => {
   const time = new Date().toLocaleString();
   const { message, color, params, i18n } = data;
   const log = {
      time: time,
      message,
      color,
      params,
      i18n
   };

   logs.value.push(log);
});

ipcRenderer.on('test-finish', (event, message) => {
   running.value = 0;
   emit('clientStatus', running.value);
   const time = new Date().toLocaleString();
   const log = {
      time: time,
      i18n: message,
      color: ''
   };

   logs.value.push(log);
});

ipcRenderer.on('report-client-list', (event, reports) => {
   reportList.value = reports;
});
</script>
