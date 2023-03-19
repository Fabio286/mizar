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

<script>
export default {
   name: 'EditMessage',
   props: {
      message: Object,
      index: Number
   },
   data () {
      return {
         staticMsg: Object.assign({}, this.$props.message)
      };
   },
   computed: {
      validation () {
         return this.staticMsg.message === '' || this.staticMsg.name === '' || this.staticMsg.format === '';
      }
   },
   methods: {
      close () {
         this.$emit('hideEditMessage');
      },
      confirm () {
         this.$emit('editMessage', this.staticMsg, this.index);
      }
   }
};
</script>
