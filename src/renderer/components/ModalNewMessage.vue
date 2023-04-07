<template>
   <div id="popcontainer">
      <div class="popup">
         <div class="box-100">
            <h4>{{ t('message.addMessage') }}</h4>
            <div class="input-element">
               <label>{{ t('word.name', 1) }}</label>
               <input
                  v-model="message.name"
                  type="text"
                  required
                  autofocus
               >
            </div>
            <div class="input-element">
               <label>{{ t('word.message', 1) }}</label>
               <textarea
                  v-model="message.message"
                  required
               />
            </div>
         </div>
         <div class="input-element">
            <label>{{ t('word.format') }}</label>
            <select v-model="message.format" required>
               <option value="" disabled>
                  {{ t('word.select') }}
               </option>
               <option value="ascii">
                  ASCII
               </option>
               <option value="hex">
                  HEX
               </option>
            </select>
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

const emit = defineEmits(['hide-add-message', 'create-message']);

const message = ref({
   message: '',
   name: '',
   enabled: true,
   format: ''
});

const { t } = useI18n();

const validation = computed(() => {
   return message.value.message === '' || message.value.name === '' || message.value.format === '';
});

const close = () => {
   emit('hide-add-message');
};

const confirm = () => {
   emit('create-message', message.value);
   message.value = {
      message: '',
      name: '',
      format: '',
      enabled: true
   };
};
</script>
