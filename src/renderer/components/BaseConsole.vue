<template>
   <div ref="root" class="console box-50">
      <div
         v-for="(log, index) in logs"
         :key="index"
         class="log"
         :class="log.color"
      >
         {{ log.time }} - <span v-html="log.message" />
      </div>
   </div>
</template>

<script setup lang="ts">
import { ref, PropType, onUpdated } from 'vue';

defineProps({
   logs: Array as PropType<{color: string; time: string; message: string}[]>
});

const root = ref(null);

onUpdated(() => {
   const elem = root.value;
   elem.scrollTop = elem.scrollHeight;
});
</script>
