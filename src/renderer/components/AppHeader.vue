<template>
   <header id="header">
      <nav id="appTabs">
         <div
            class="navTab"
            :class="{ selected : selTab === 0 }"
            @click="selectTab(0)"
         >
            Client
            <transition name="fade">
               <i
                  v-if="clientStatus === 1"
                  class="material-icons running"
                  title="In esecuzione"
               >play_arrow</i>
            </transition>
         </div>
         <div
            class="navTab"
            :class="{ selected : selTab === 1 }"
            @click="selectTab(1)"
         >
            Server
            <transition name="fade">
               <i
                  v-if="serverStatus === 1"
                  class="material-icons running"
                  title="In esecuzione"
               >play_arrow</i>
            </transition>
         </div>
      </nav>
   </header>
</template>

<script setup lang="ts">
defineProps({
   selTab: Number,
   clientStatus: Number,
   serverStatus: Number
});

const emit = defineEmits(['selectTab']);

const selectTab = (value: number) => {
   emit('selectTab', value);
};
</script>
