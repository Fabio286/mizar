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
            <server-reports
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

<script>
import Console from './console.vue';
import Ports from './ports.vue';
import NewPort from './new-port.vue';
import ServerReports from './server-reports.vue';
import { ipcRenderer } from 'electron';

export default {
   name: 'Server',
   components: {
      Console,
      Ports,
      NewPort,
      ServerReports
   },
   data () {
      return {
         running: 0,
         params: {
            trace: false,
            echo: true,
            alertReset: false
         },
         logs: [],
         portList: [],
         reportList: [],
         popNewPort: false
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
      ipcRenderer.on('serverLog', (event, data) => {
         let time = new Date().toLocaleString();
         let { message, color } = data;
         let log = {
            time: time,
            message,
            color
         };

         this.logs.push(log);
      });

      ipcRenderer.on('serverFinish', (event, message) => {
         this.running = 0;
         this.reportList = [];
         this.$emit('serverStatus', this.running);
         let time = new Date().toLocaleString();
         let log = {
            time: time,
            message,
            color: ''
         };

         this.logs.push(log);
      });

      ipcRenderer.send('getPorts');
      ipcRenderer.on('portList', (event, ports) => {
         this.portList = ports;
      });

      ipcRenderer.on('reportServerList', (event, reports) => {
         this.reportList = reports;
      });
   },
   methods: {
      saveTest (e) {
         e.preventDefault();
      },
      startServer (e) {
         e.preventDefault();
         this.running = 1;
         this.$emit('serverStatus', this.running);
         let obj = {
            params: this.params,
            ports: this.portList.filter((port) => {
               return port.enabled === true;
            })
         };
         ipcRenderer.send('startServer', obj);
      },
      stopServer (e) {
         e.preventDefault();
         ipcRenderer.send('stopServer');
      },
      updatePorts () {
         ipcRenderer.send('updatePorts', this.portList);
      },
      showAddPort () {
         this.popNewPort = true;
      },
      hideAddPort () {
         this.popNewPort = false;
      },
      createPort (port) {
         this.portList.push(port);
         this.popNewPort = false;
         ipcRenderer.send('updatePorts', this.portList);
      },
      deletePort (portId) {
         this.portList.splice(portId, 1);
         ipcRenderer.send('updatePorts', this.portList);
      },
      resetReports () {
         ipcRenderer.send('resetReports');
      },
      togglePortCheck (status) {
         if (this.running !== 0) return;
         let enable = status === 0;
         this.portList.forEach((host) => {
            host.enabled = enable;
         });

         ipcRenderer.send('updatePorts', this.portList);
      }
   }
};
</script>
