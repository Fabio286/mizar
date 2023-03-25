<template>
   <div id="popcontainer">
      <div class="popup">
         <div class="box-100">
            <h4>Modifica Messaggio</h4>
            <div class="input-element">
               <label>Nome</label>
               <input
                  v-model="staticMsg.name"
                  type="text"
                  required
                  autofocus
               >
            </div>
            <div class="input-element">
               <label>Messaggio</label>
               <textarea
                  v-model="staticMsg.message"
                  required
               >Corpo del messaggio</textarea>
            </div>
         </div>
         <div class="input-element">
            <label>Formato</label>
            <select v-model="staticMsg.format" required>
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
               Modifica
            </button>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps({
   message: Object,
   index: Number
});

const staticMsg = ref(Object.assign({}, props.message));

const emit = defineEmits(['hideEditMessage', 'editMessage']);

const validation = computed(() => {
   return staticMsg.value.message === '' || staticMsg.value.name === '' || staticMsg.value.format === '';
});

const close = () => {
   emit('hideEditMessage');
};

const confirm = () => {
   emit('editMessage', staticMsg.value, props.index);
};
</script>
