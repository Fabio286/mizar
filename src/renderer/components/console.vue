<template>
   <div class="console box-50">
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

<script>
export default {
   name: 'Console',
   props: {
      logs: Array
   },
   updated () {
      var elem = this.$el;
      elem.scrollTop = elem.scrollHeight;
   }
};
</script>
