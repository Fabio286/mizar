<template>
   <div ref="root" class="console box-50">
      <div
         v-for="(log, index) in logs"
         :key="index"
         class="log"
         :class="log.color"
      >
         {{ log.time }} - <span v-if="log.message" v-html="log.message" /><span v-else-if="log.i18n">{{ t(`message.${ log.i18n }`, log.params) }}</span>
      </div>
   </div>
</template>

<script setup lang="ts">
import { ref, PropType, onUpdated } from 'vue';
import { useI18n } from 'vue-i18n';

defineProps({
   logs: Array as PropType<{
      color: string;
      time: string;
      message: string;
      i18n?: string;
      params: {[key: string]: string};
   }[]>
});
const { t } = useI18n();

const root = ref(null);

onUpdated(() => {
   const elem = root.value;
   elem.scrollTop = elem.scrollHeight;
});
</script>
