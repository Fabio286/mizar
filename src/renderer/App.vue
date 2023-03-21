<template>
   <div id="wrapper">
      <AppHeader
         ref="header"
         :sel-tab="selTab"
         :client-status="clientStatus"
         :server-status="serverStatus"
         @select-tab="selectTab"
      />
      <div id="main">
         <Client
            v-show="selTab === 0"
            ref="client"
            @client-status="clientUpdateStatus"
         />
         <Server
            v-show="selTab === 1"
            ref="server"
            @server-status="serverUpdateStatus"
         />
      </div>
   </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import AppHeader from '@/components/app-header.vue';
import Client from '@/components/client.vue';
import Server from '@/components/server.vue';

const { t } = useI18n();

const selTab = ref(0);
const clientStatus = ref(0);
const serverStatus = ref(0);

const selectTab = (value: number) => {
   selTab.value = value;
};

const clientUpdateStatus = (value: number) => {
   clientStatus.value = value;
};

const serverUpdateStatus = (value: number) => {
   serverStatus.value = value;
};

</script>

<style lang="scss">
.fade-enter-active, .fade-leave-active {
  transition: opacity .2s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
