<template>
   <div
      id="portBox"
      ref="root"
      class="box-100"
   >
      <h3>
         <span class="toggle-select"><i
            class="mdi"
            :class="[checkIcon(checkStatus)]"
            @click="toggleCheck(checkStatus)"
         /></span><span>{{ t('word.port', 2) }}</span>
      </h3>
      <div class="tools-box">
         <div class="round-button green-bg" @click="showAdd">
            <span>{{ t('message.addPort') }}</span>
            <i class="mdi mdi-plus" />
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
               class="mdi mdi-close deletePort"
               :title="`Elimina porta ${port.port}`"
               @click="deletePort(index)"
            />
         </li>
      </ul>
   </div>
</template>

<script setup lang="ts">
import { ServerPort } from 'common/interfaces';
import { ref, computed, onUpdated, PropType } from 'vue';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['update-ports', 'show-add-port', 'delete-port', 'toggle-port-check']);

const props = defineProps({
   portList: Array as PropType<ServerPort[]>
});

const { t } = useI18n();

const root = ref(null);

const checkStatus = computed(() => {
   const checked = props.portList.filter((port) => {
      return port.enabled;
   });
   if (props.portList.length === checked.length)
      return 2;
   else if (checked.length > 0)
      return 1;
   else
      return 0;
});

const sortedPorts = computed(() => {
   const localPortList = props.portList;
   return localPortList.sort((a, b) => a.port - b.port);
});

const updatePorts = () => {
   emit('update-ports');
};

const showAdd = () => {
   emit('show-add-port');
};

const deletePort = (value: number) => {
   emit('delete-port', value);
};

const checkIcon = (status: number) => {
   switch (status) {
      case 0:
         return 'mdi-checkbox-blank-outline';
      case 1:
         return 'mdi-minus-box';
      case 2:
         return 'mdi-checkbox-marked';
   }
};

const toggleCheck = (status: number) => {
   emit('toggle-port-check', status);
};

onUpdated(() => {
   const elem = root.value;
   elem.scrollTop = elem.scrollHeight;
});
</script>
