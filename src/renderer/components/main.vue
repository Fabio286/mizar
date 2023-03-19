<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity .2s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>

<template>
   <div id="wrapper">
      <AppHeader
         ref="header"
         :sel-tab="selTab"
         :client-status="clientStatus"
         :server-status="serverStatus"
         @selectTab="selectTab"
      />
      <div id="main">
         <Client
            v-show="selTab === 0"
            ref="client"
            @clientStatus="clientUpdateStatus"
         />
         <Server
            v-show="selTab === 1"
            ref="server"
            @serverStatus="serverUpdateStatus"
         />
      </div>
   </div>
</template>

<script>
import AppHeader from './app-header.vue';
import Client from './client.vue';
import Server from './server.vue';

export default {
   name: 'Main',
   components: {
      AppHeader,
      Client,
      Server
   },
   data () {
      return {
         selTab: 0,
         clientStatus: 0,
         serverStatus: 0
      };
   },
   methods: {
      selectTab (value) {
         this.selTab = value;
      },
      clientUpdateStatus (value) {
         this.clientStatus = value;
      },
      serverUpdateStatus (value) {
         this.serverStatus = value;
      }
   }
};
</script>
