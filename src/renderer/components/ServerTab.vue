<template>
   <div class="flex box-100">
      <div id="server" class="box-50">
         <transition name="fade">
            <NewPort
               v-show="popNewPort"
               @hideAddPort="hideAddPort"
               @createPort="createPort"
            />
         </transition>
         <form autocomplete="off" @submit.prevent="startServer">
            <fieldset :disabled="running !== 0">
               <Ports
                  ref="ports"
                  :port-list="portList"
                  @updatePorts="updatePorts"
                  @showAddPort="showAddPort"
                  @deletePort="deletePort"
                  @togglePortCheck="togglePortCheck"
               />
               <div class="flex box-100">
                  <div class="box-50">
                     <label class="checkbox">
                        <input
                           v-model="params.echo"
                           type="checkbox"
                        >
                        <div class="checkbox-block" />
                        <span>Echo Server</span>
                     </label>
                     <label class="checkbox">
                        <input
                           v-model="params.trace"
                           type="checkbox"
                        >
                        <div class="checkbox-block" />
                        <span>Abilita Trace</span>
                     </label>
                  </div>
                  <div class="box-50">
                     <label class="checkbox">
                        <input
                           v-model="params.alertReset"
                           type="checkbox"
                        >
                        <div class="checkbox-block" />
                        <span>Allerta ECONNRESET</span>
                     </label>
                  </div>
               </div>
            </fieldset>
            <div class="buttons">
               <div v-if="running === 0" class="button-wrap">
                  <i class="material-icons white">play_arrow</i>
                  <button class="confirm" type="submit">
                     Start
                  </button>
               </div>
               <div v-if="running === 1" class="button-wrap">
                  <i class="material-icons white">stop</i>
                  <button class="stop" @click="stopServer">
                     Stop
                  </button>
               </div>
            </div>
         </form>
         <transition name="fade">
            <SerterTabReports
               v-if="reportList.length > 0"
               ref="reports"
               :reports="reportList"
               @resetReports="resetReports"
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
import { ref, computed } from 'vue';
import Console from './BaseConsole.vue';
import Ports from './ServerTabPorts.vue';
import NewPort from './ModalNewPort.vue';
import SerterTabReports from './SerterTabReports.vue';
import { ipcRenderer } from 'electron';

const emit = defineEmits(['serverStatus']);

const running = ref(0);
const params = ref({
   trace: false,
   echo: true,
   alertReset: false
});
const logs = ref([]);
const portList = ref([]);
const reportList = ref([]);
const popNewPort = ref(false);

const slicedLogs = computed(() => {
   if (logs.value.length > 500)
      logs.value = logs.value.slice(-500);

   return logs.value;
});

// const saveTest = (e: MouseEvent) => {
//    e.preventDefault();
// };

const startServer = (e: MouseEvent) => {
   e.preventDefault();
   running.value = 1;
   emit('serverStatus', running.value);
   const obj = {
      params: params.value,
      ports: portList.value.filter((port) => {
         return port.enabled === true;
      })
   };
   ipcRenderer.send('startServer', obj);
};

const stopServer = (e: MouseEvent) => {
   e.preventDefault();
   ipcRenderer.send('stopServer');
};

const updatePorts = () => {
   ipcRenderer.send('updatePorts', portList.value);
};

const showAddPort = () => {
   popNewPort.value = true;
};

const hideAddPort = () => {
   popNewPort.value = false;
};

const createPort = (port: number) => {
   portList.value.push(port);
   popNewPort.value = false;
   ipcRenderer.send('updatePorts', portList.value);
};

const deletePort = (portId: number) => {
   portList.value.splice(portId, 1);
   ipcRenderer.send('updatePorts', portList.value);
};

const resetReports = () => {
   ipcRenderer.send('resetReports');
};

const togglePortCheck = (status: number) => {
   if (running.value !== 0) return;
   const enable = status === 0;
   portList.value.forEach((host) => {
      host.enabled = enable;
   });

   ipcRenderer.send('updatePorts', portList.value);
};

ipcRenderer.on('serverLog', (event, data) => {
   const time = new Date().toLocaleString();
   const { message, color } = data;
   const log = {
      time: time,
      message,
      color
   };

   logs.value.push(log);
});

ipcRenderer.on('serverFinish', (event, message) => {
   running.value = 0;
   reportList.value = [];
   emit('serverStatus', running.value);
   const time = new Date().toLocaleString();
   const log = {
      time: time,
      message,
      color: ''
   };

   logs.value.push(log);
});

ipcRenderer.send('getPorts');
ipcRenderer.on('portList', (event, ports) => {
   portList.value = ports;
});

ipcRenderer.on('reportServerList', (event, reports) => {
   reportList.value = reports;
});
</script>
