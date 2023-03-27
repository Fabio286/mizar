<template>
   <div
      id="hostBox"
      ref="root"
      class="box-100"
   >
      <h3>
         <span class="toggle-select"><i class="material-icons" @click="toggleCheck(checkStatus)">{{ checkIcon(checkStatus)
         }}</i></span><span>Hosts</span>
      </h3>
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

<script setup lang="ts">
import { ClientHost } from '@/stores/client';
import { ref, computed, onUpdated, PropType } from 'vue';

const root = ref(null);

const props = defineProps({
   hostList: Array as PropType<ClientHost[]>
});

const emit = defineEmits(['updateHosts', 'showAddHost', 'deleteHost', 'toggleHostCheck']);

const checkStatus = computed(() => {
   const checked = props.hostList.filter((host) => {
      return host.enabled;
   });
   if (props.hostList.length === checked.length)
      return 2;
   else if (checked.length > 0)
      return 1;
   else
      return 0;
});

const sortedHosts = computed(() => {
   const localHostList = props.hostList;
   return localHostList.sort((a, b) => (a.host < b.host ? -1 : (a.host > b.host ? 1 : 0)) || a.port - b.port);
});

const updateHosts = () => {
   emit('updateHosts');
};

const showAdd = () => {
   emit('showAddHost');
};

const deleteHost = (value: number) => {
   emit('deleteHost', value);
};

const checkIcon = (status: number) => {
   switch (status) {
      case 0:
         return 'check_box_outline_blank';
      case 1:
         return 'indeterminate_check_box';
      case 2:
         return 'check_box';
   }
};

const toggleCheck = (status: number) => {
   emit('toggleHostCheck', status);
};

onUpdated(() => {
   const elem = root.value;
   elem.scrollTop = elem.scrollHeight;
});
</script>
