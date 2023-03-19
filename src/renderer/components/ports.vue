<template>
   <div id="portBox" class="box-100">
      <h3><span class="toggle-select"><i class="material-icons" @click="toggleCheck(checkStatus)">{{ checkIcon(checkStatus) }}</i></span><span>Porte</span></h3>
      <div class="tools-box">
         <div class="round-button green-bg" @click="showAdd">
            <span>Aggiungi Porta</span>
            <i class="material-icons">add</i>
         </div>
      </div>
      <ul id="portList">
         <li v-for="(port, index) in sortedPorts" :key="index">
            <label class="checkbox">
               <input
                  v-model="port.enabled"
                  type="checkbox"
                  @change="updatePorts"
               >
               <div class="checkbox-block" />
               <span>{{ port.port }}</span>
            </label>
            <i
               class="material-icons deletePort"
               :title="`Elimina porta ${port.port}`"
               @click="deletePort(index)"
            >clear</i>
         </li>
      </ul>
   </div>
</template>

<script>
export default {
   name: 'Ports',
   props: {
      portList: Array
   },
   computed: {
      checkStatus () {
         let checked = this.portList.filter((port) => {
            return port.enabled;
         });
         if (this.portList.length === checked.length)
            return 2;
         else if (checked.length > 0)
            return 1;
         else
            return 0;
      },
      sortedPorts () {
         return this.$props.portList.sort((a, b) => a.port - b.port);
      }
   },
   updated () {
      var elem = this.$el;
      elem.scrollTop = elem.scrollHeight;
   },
   methods: {
      updatePorts () {
         this.$emit('updatePorts');
      },
      showAdd () {
         this.$emit('showAddPort');
      },
      deletePort (value) {
         this.$emit('deletePort', value);
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
         this.$emit('togglePortCheck', status);
      }
   }
};
</script>
