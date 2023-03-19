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

<script>
export default {
   name: 'NewPort',
   data () {
      return {
         port: {
            port: '',
            enabled: true
         },
         errMsg: ''
      };
   },
   computed: {
      validation () {
         return this.port.port === '' || this.port.port > 65535 || this.port.port < 1;
      }
   },
   methods: {
      close () {
         this.$emit('hideAddPort');
         this.port = {
            port: '',
            enabled: true
         };
         this.errMsg = '';
      },
      confirm () {
         let portList = this.$parent.portList;
         if (portList.findIndex((port) => port.port === this.port.port) < 0) {
            this.$emit('createPort', this.port);
            this.port = {
               port: '',
               enabled: true
            };
            this.errMsg = '';
         }
         else this.errMsg = 'Porta già esistente!';
      }
   }
};
</script>
