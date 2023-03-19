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

<script>
export default {
   name: 'NewMessage',
   data () {
      return {
         message: {
            message: '',
            name: '',
            enabled: true,
            format: ''
         }
      };
   },
   computed: {
      validation () {
         return this.message.message === '' || this.message.name === '' || this.message.format === '';
      }
   },
   methods: {
      close () {
         this.$emit('hideAddMessage');
      },
      confirm () {
         this.$emit('createMessage', this.message);
         this.message = {
            message: '',
            name: '',
            format: '',
            enabled: true
         };
      }
   }
};
</script>
