<template>
   <div
      id="hostBox"
      ref="root"
      class="box-100"
   >
      <h3>
         <span class="toggle-select"><i class="material-icons" @click="toggleCheck(checkStatus)">{{ checkIcon(checkStatus)
         }}</i></span><span>
            {{ t('word.host', 2) }}</span>
      </h3>
      <div class="tools-box">
         <div class="round-button green-bg" @click="showAdd">
            <span>{{ t('message.addHost') }}</span>
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
               :title="t('message.deleteHost', {host: `${host.host}:${host.port}`})"
               @click="deleteHost(index)"
            >clear</i>
         </li>
      </ul>
   </div>
</template>

<script setup lang="ts">
import { ClientHost } from 'common/interfaces';
import { ref, computed, onUpdated, PropType } from 'vue';
import { useI18n } from 'vue-i18n';

const root = ref(null);

const props = defineProps({
   hostList: Array as PropType<ClientHost[]>
});

const { t } = useI18n();

const emit = defineEmits(['update-hosts', 'show-add-host', 'delete-host', 'toggle-host-check']);

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
   emit('update-hosts');
};

const showAdd = () => {
   emit('show-add-host');
};

const deleteHost = (value: number) => {
   emit('delete-host', value);
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
   emit('toggle-host-check', status);
};

onUpdated(() => {
   const elem = root.value;
   elem.scrollTop = elem.scrollHeight;
});
</script>
