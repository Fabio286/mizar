<template>
   <div id="popcontainer">
      <div class="popup">
         <div class="box-100">
            <h4>Configurazioni Salvate</h4>
            <ul id="configList">
               <li
                  v-for="(config, index) in configList"
                  :key="index"
               >
                  <span
                     @mouseover="selected = index"
                     @mouseleave="selected = null"
                  >
                     <i
                        v-if="selected !== index"
                        class="material-icons radio-btn"
                     >radio_button_unchecked</i>
                     <i
                        v-if="selected === index"
                        title="Seleziona"
                        class="material-icons radio-btn"
                        @click="loadConfig(index)"
                     >radio_button_checked</i>
                  </span>
                  <span>{{ config.name }} ({{ config.time }})</span>
                  <i
                     class="material-icons deleteConfig"
                     :title="`Elimina configurazione ${config.name}`"
                     @click="deleteConfig(index)"
                  >clear</i>
               </li>
            </ul>
         </div>
         <div class="buttons">
            <button class="cancel" @click="close">
               Chiudi
            </button>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron';
import { ref } from 'vue';

const configList = ref([]);
const selected = ref(null);

const emit = defineEmits(['loadConfig', 'hideLoadConfig']);

const close = () => {
   emit('hideLoadConfig');
   selected.value = null;
};

const deleteConfig = (index: number) => {
   configList.value.splice(index, 1);
   ipcRenderer.send('updateClientConfig', configList.value);
};

const loadConfig = (index: number) => {
   selected.value = index;
   emit('loadConfig', configList.value[index]);
   close();
};

ipcRenderer.send('getClientConfigs');
ipcRenderer.on('configList', (event, configs) => {
   configList.value = configs;
});
</script>
