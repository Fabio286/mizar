<template>
   <div id="messageBox" class="box-100">
      <h3><span class="toggle-select"><i class="material-icons" @click="toggleCheck(checkStatus)">{{ checkIcon(checkStatus) }}</i></span><span>Messaggi</span></h3>
      <div class="tools-box">
         <div class="round-button green-bg" @click="showAdd">
            <span>Aggiungi Messaggio</span>
            <i class="material-icons">add</i>
         </div>
      </div>
      <ul id="messageList">
         <li v-for="(message, index) in sortedMessages" :key="index">
            <label class="checkbox">
               <input
                  v-model="message.enabled"
                  type="checkbox"
                  @change="updateMessages"
               >
               <div class="checkbox-block" />
               <span class="format">({{ message.format }})</span>
               <span>{{ message.name | truncate(25, '...') }}</span>
            </label>
            <i
               class="material-icons editMessage"
               :title="`Modifica messaggio ${message.name}`"
               @click="showEdit(index)"
            >edit</i>
            <i
               class="material-icons deleteMessage"
               :title="`Elimina messaggio ${message.name}`"
               @click="deleteMessage(index)"
            >clear</i>
         </li>
      </ul>
   </div>
</template>

<script>
export default {
   name: 'Messages',
   filters: {
      truncate (text, length, suffix) {
         if (text.length <= length) suffix = '';
         return text.substring(0, length) + suffix;
      }
   },
   props: {
      messageList: Array
   },
   computed: {
      checkStatus () {
         let checked = this.messageList.filter((message) => {
            return message.enabled;
         });
         if (this.messageList.length === checked.length)
            return 2;
         else if (checked.length > 0)
            return 1;
         else
            return 0;
      },
      sortedMessages () {
         return this.$props.messageList.sort((a, b) => (a.name < b.name ? -1 : (a.name > b.name ? 1 : 0)));
      }
   },
   updated () {
      var elem = this.$el;
      elem.scrollTop = elem.scrollHeight;
   },
   methods: {
      updateMessages () {
         this.$emit('updateMessages');
      },
      showAdd () {
         this.$emit('showAddMessage');
      },
      showEdit (message, index) {
         this.$emit('showEditMessage', message, index);
      },
      deleteMessage (value) {
         this.$emit('deleteMessage', value);
      },
      checkIcon (status) {
         switch (status) {
            case 0:
               return 'check_box_outline_blank';
            case 1:
               return 'indeterminate_check_box';
            case 2:
               return 'check_box';
         }
      },
      toggleCheck (status) {
         this.$emit('toggleMessageCheck', status);
      }
   }
};
</script>
