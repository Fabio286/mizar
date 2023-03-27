<template>
   <div id="popcontainer">
      <div class="popup">
         <div class="box-100">
            <h4>Nuova porta</h4>
            <div class="input-element">
               <label>Porta</label>
               <input
                  v-model.number="port.port"
                  min="1"
                  max="65535"
                  step="1"
                  type="number"
                  required
                  autofocus
               >
               <span class="input-msg">{{ errMsg }}</span>
            </div>
         </div>
         <div class="buttons">
            <button class="cancel" @click="close">
               Annulla
            </button>
            <button
               class="confirm"
               :disabled="validation"
               @click="confirm"
            >
               Crea
            </button>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { ServerPort } from '@/stores/server';
import { ref, computed, PropType } from 'vue';

const emit = defineEmits(['hideAddPort', 'createPort']);

const props = defineProps({
   portList: Array as PropType<ServerPort[]>
});

const port = ref({
   port: null,
   enabled: true
});
const errMsg = ref('');

const validation = computed(() => {
   return port.value.port === null || port.value.port > 65535 || port.value.port < 1;
});

const close = () => {
   emit('hideAddPort');
   port.value = {
      port: '',
      enabled: true
   };
   errMsg.value = '';
};

const confirm = () => {
   if (props.portList.findIndex((p) => p.port === port.value.port) < 0) {
      emit('createPort', port.value);
      port.value = {
         port: '',
         enabled: true
      };
      errMsg.value = '';
   }
   else errMsg.value = 'Porta già esistente!';
};
</script>
