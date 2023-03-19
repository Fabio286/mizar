<template>
   <div id="popcontainer">
      <div class="popup">
         <div class="box-100">
            <h4>Nuovo Host</h4>
            <div class="input-element">
               <label>Indirizzo Host</label>
               <input
                  v-model="host.host"
                  type="text"
                  required
                  autofocus
               >
            </div>
            <div class="input-element">
               <label>Porta</label>
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

<script>
export default {
   name: 'NewHost',
   data () {
      return {
         host: {
            host: '',
            port: '',
            enabled: true
         }
      };
   },
   computed: {
      validation () {
         return this.host.host === '' || this.host.port === '';
      }
   },
   methods: {
      close () {
         this.$emit('hideAddHost');
      },
      confirm () {
         this.$emit('createHost', this.host);
         this.host = {
            host: '',
            port: '',
            enabled: true
         };
      }
   }
};
</script>
