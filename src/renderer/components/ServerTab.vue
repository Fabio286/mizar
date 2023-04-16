<template>
   <div class="flex box-100">
      <div id="server" class="box-50">
         <transition name="fade">
            <NewPort
               v-show="popNewPort"
               :port-list="localPorts"
               @hide-add-port="hideAddPort"
               @create-port="createPort"
            />
         </transition>
         <form autocomplete="off" @submit.prevent="startServer">
            <fieldset :disabled="running !== 0">
               <Ports
                  ref="ports"
                  :port-list="localPorts"
                  @update-ports="updatePorts"
                  @show-add-port="showAddPort"
                  @delete-port="deletePort"
                  @toggle-port-check="togglePortCheck"
               />
               <div class="flex box-100">
                  <div class="box-50">
                     <label class="checkbox">
                        <input
                           v-model="params.echo"
                           type="checkbox"
                        >
                        <div class="checkbox-block" />
                        <span>{{ t('message.echoServer') }}</span>
                     </label>
                     <label class="checkbox">
                        <input
                           v-model="params.trace"
                           type="checkbox"
                        >
                        <div class="checkbox-block" />
                        <span>{{ t('message.enableTrace') }}</span>
                     </label>
                  </div>
                  <div class="box-50">
                     <label class="checkbox">
                        <input
                           v-model="params.alertReset"
                           type="checkbox"
                        >
                        <div class="checkbox-block" />
                        <span>{{ t('message.alertEconnreset') }}</span>
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
               <div v-if="running === 1" class="button-wrap">
                  <i class="material-icons white">stop</i>
                  <button class="stop" @click="stopServer">
                     {{ t('word.stop') }}
                  </button>
               </div>
            </div>
         </form>
         <transition name="fade">
            <ServerTabReports
               v-if="reportList.length > 0"
               ref="reports"
               :reports="reportList"
               @reset-reports="resetReports"
            />
         </transition>
      </div><!-- /server -->
      <Console
         ref="console"
         :logs="slicedLogs"
      />
   </div>
</template>

<script setup lang="ts">
import { ref, computed, Ref, onBeforeUnmount } from 'vue';
import { storeToRefs } from 'pinia';
import Console from './BaseConsole.vue';
import Ports from './ServerTabPorts.vue';
import NewPort from './ModalNewPort.vue';
import { ServerPort } from 'common/interfaces';
import ServerTabReports from './ServerTabReports.vue';
import { ipcRenderer } from 'electron';
import { useServerStore } from '@/stores/server';
import { unproxify } from '../libs/unproxify';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['serverStatus']);
const { t } = useI18n();

const serverStore = useServerStore();

const { ports } = storeToRefs(serverStore);
const { updatePorts: updateStorePorts } = serverStore;

const running = ref(0);
const params = ref({
   trace: false,
   echo: false,
   alertReset: false
});
const logs = ref([]);
const reportList = ref([]);
const popNewPort = ref(false);
const localPorts = ref(ports.value);
const logsCache = ref([]);
const logsInterval: Ref<NodeJS.Timer> = ref(null);

const slicedLogs = computed(() => {
   if (logs.value.length > 500)
      return logs.value.slice(-500);
   return logs.value;
});

const startServer = (e: MouseEvent) => {
   e.preventDefault();
   running.value = 1;
   emit('serverStatus', running.value);
   const obj = {
      params: params.value,
      ports: localPorts.value.filter((port) => {
         return port.enabled === true;
      })
   };
   ipcRenderer.send('start-server', unproxify(obj));
};

const stopServer = (e: MouseEvent) => {
   e.preventDefault();
   ipcRenderer.send('stop-server');
};

const updatePorts = () => {
   updateStorePorts(localPorts.value);
};

const showAddPort = () => {
   popNewPort.value = true;
};

const hideAddPort = () => {
   popNewPort.value = false;
};

const createPort = (port: ServerPort) => {
   localPorts.value.push(port);
   popNewPort.value = false;
   updateStorePorts(localPorts.value);
};

const deletePort = (portId: number) => {
   localPorts.value.splice(portId, 1);
   updateStorePorts(localPorts.value);
};

const resetReports = () => {
   ipcRenderer.send('reset-reports');
};

const togglePortCheck = (status: number) => {
   if (running.value !== 0) return;
   const enable = status === 0;
   localPorts.value.forEach((host) => {
      host.enabled = enable;
   });

   updateStorePorts(localPorts.value);
};

ipcRenderer.on('server-log', (event, data) => {
   const time = new Date().toLocaleString();
   const { message, color, params, i18n } = data;
   const log = {
      time: time,
      message,
      color,
      params,
      i18n
   };

   logsCache.value.push(log);
});

ipcRenderer.on('server-finish', (event, message) => {
   running.value = 0;
   reportList.value = [];
   emit('serverStatus', running.value);
   const time = new Date().toLocaleString();
   const log = {
      time: time,
      i18n: message,
      color: ''
   };

   logs.value.push(log);
});

ipcRenderer.on('report-server-list', (event, reports) => {
   reportList.value = reports;
});

logsInterval.value = setInterval(() => {
   if (logsCache.value.length) {
      logs.value.push(...logsCache.value);
      logsCache.value = [];
   }
}, 100);

onBeforeUnmount(() => {
   clearInterval(logsInterval.value);
   logsInterval.value = null;
});
</script>
