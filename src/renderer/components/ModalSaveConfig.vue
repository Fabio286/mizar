<template>
   <div id="popcontainer">
      <div class="popup">
         <div class="box-100">
            <h4>Nuova Configurazione</h4>
            <div class="input-element">
               <label>Nome</label>
               <input
                  v-model="name"
                  type="text"
                  placeholder="Nome configurazione"
                  required
               >
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
               Salva
            </button>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const emit = defineEmits(['hideSaveConfig', 'saveConfig']);

const props = defineProps({
   params: Object
});

const name = ref('');

const validation = computed(() => {
   return name.value === '';
});

const close = () => {
   emit('hideSaveConfig');
};

const confirm = () => {
   const config = {
      name: name.value,
      time: new Date().toLocaleString(),
      params: props.params
   };
   emit('saveConfig', config);
};
</script>
