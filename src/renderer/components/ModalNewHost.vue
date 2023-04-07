<template>
   <div id="popcontainer">
      <div class="popup">
         <div class="box-100">
            <h4>{{ t('message.addHost') }}</h4>
            <div class="input-element">
               <label>{{ t('message.hostAddress') }}</label>
               <input
                  v-model="host.host"
                  type="text"
                  required
                  autofocus
               >
            </div>
            <div class="input-element">
               <label>{{ t('word.port', 1) }}</label>
               <input
                  v-model.number="host.port"
                  min="1"
                  step="1"
                  type="number"
                  required
               >
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
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['hide-add-host', 'create-host']);

const host = ref({
   host: '',
   port: '',
   enabled: true
});

const { t } = useI18n();

const validation = computed(() => {
   return host.value.host === '' || host.value.port === '';
});

const close = () => {
   emit('hide-add-host');
};

const confirm = () => {
   emit('create-host', host.value);
   host.value = {
      host: '',
      port: '',
      enabled: true
   };
};
</script>
