<template>
   <div id="popcontainer">
      <div class="popup">
         <div class="box-100">
            <h4>Nuovo Messaggio</h4>
            <div class="input-element">
               <label>Nome</label>
               <input
                  v-model="message.name"
                  type="text"
                  required
                  autofocus
               >
            </div>
            <div class="input-element">
               <label>Messaggio</label>
               <textarea
                  v-model="message.message"
                  required
               >Corpo del messaggio</textarea>
            </div>
         </div>
         <div class="input-element">
            <label>Formato</label>
            <select v-model="message.format" required>
               <option value="" disabled>
                  Seleziona
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
import { ref, computed } from 'vue';

const emit = defineEmits(['hideAddMessage', 'createMessage']);

const message = ref({
   message: '',
   name: '',
   enabled: true,
   format: ''
});

const validation = computed(() => {
   return message.value.message === '' || message.value.name === '' || message.value.format === '';
});

const close = () => {
   emit('hideAddMessage');
};

const confirm = () => {
   emit('createMessage', message.value);
   message.value = {
      message: '',
      name: '',
      format: '',
      enabled: true
   };
};
</script>
