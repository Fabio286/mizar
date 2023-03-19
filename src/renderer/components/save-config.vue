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

<script>
export default {
   name: 'SaveCongif',
   props: {
      params: Object
   },
   data () {
      return {
         name: ''
      };
   },
   computed: {
      validation () {
         return this.name === '';
      }
   },
   methods: {
      close () {
         this.$emit('hideSaveConfig');
      },
      confirm () {
         let config = {
            name: this.name,
            time: new Date().toLocaleString(),
            params: this.$props.params
         };
         this.$emit('saveConfig', config);
      }
   }
};
</script>
