<template>
   <div id="popcontainer">
      <div class="popup">
         <div class="box-100">
            <h4>{{ t('message.addPort') }}</h4>
            <div class="input-element">
               <label>{{ t('word.port', 1) }}</label>
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
               {{ t('word.cancel') }}
            </button>
            <button
               class="confirm"
               :disabled="validation"
               @click="confirm"
            >
               {{ t('word.create') }}
            </button>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { ServerPort } from 'common/interfaces';
import { ref, computed, PropType } from 'vue';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['hide-add-port', 'create-port']);

const props = defineProps({
   portList: Array as PropType<ServerPort[]>
});

const { t } = useI18n();

const port = ref({
   port: null,
   enabled: true
});
const errMsg = ref('');

const validation = computed(() => {
   return port.value.port === null || port.value.port > 65535 || port.value.port < 1;
});

const close = () => {
   emit('hide-add-port');
   port.value = {
      port: '',
      enabled: true
   };
   errMsg.value = '';
};

const confirm = () => {
   if (props.portList.findIndex((p) => p.port === port.value.port) < 0) {
      emit('create-port', port.value);
      port.value = {
         port: '',
         enabled: true
      };
      errMsg.value = '';
   }
   else errMsg.value = 'Porta già esistente!';
};
</script>
