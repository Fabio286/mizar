<template>
   <div id="hostBox" class="box-100">
      <h3><span class="toggle-select"><i class="material-icons" @click="toggleCheck(checkStatus)">{{ checkIcon(checkStatus) }}</i></span><span>Hosts</span></h3>
      <div class="tools-box">
         <div class="round-button green-bg" @click="showAdd">
            <span>Aggiungi Host</span>
            <i class="material-icons">add</i>
         </div>
      </div>
      <ul id="hostList">
         <li v-for="(host, index) in sortedHosts" :key="index">
            <label class="checkbox">
               <input
                  v-model="host.enabled"
                  type="checkbox"
                  @change="updateHosts"
               >
               <div class="checkbox-block" />
               <span>{{ host.host }}:{{ host.port }}</span>
            </label>
            <i
               class="material-icons deleteHost"
               :title="`Elimina host ${host.host}:${host.port}`"
               @click="deleteHost(index)"
            >clear</i>
         </li>
      </ul>
   </div>
</template>

<script>
export default {
   name: 'Hosts',
   props: {
      hostList: Array
   },
   computed: {
      checkStatus () {
         let checked = this.hostList.filter((host) => {
            return host.enabled;
         });
         if (this.hostList.length === checked.length)
            return 2;
         else if (checked.length > 0)
            return 1;
         else
            return 0;
      },
      sortedHosts () {
         return this.$props.hostList.sort((a, b) => (a.host < b.host ? -1 : (a.host > b.host ? 1 : 0)) || a.port - b.port);
      }
   },
   updated () {
      var elem = this.$el;
      elem.scrollTop = elem.scrollHeight;
   },
   methods: {
      updateHosts () {
         this.$emit('updateHosts');
      },
      showAdd () {
         this.$emit('showAddHost');
      },
      deleteHost (value) {
         this.$emit('deleteHost', value);
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
         this.$emit('toggleHostCheck', status);
      }
   }
};
</script>
