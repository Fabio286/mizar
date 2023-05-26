<template>
   <header id="header">
      <nav id="appTabs">
         <div
            class="navTab"
            :class="{ selected : selTab === 0 }"
            @click="selectTab(0)"
         >
            {{ t('word.client', 1) }}
            <transition name="fade">
               <i
                  v-if="clientStatus === 1"
                  class="mdi mdi-play running"
                  :title="t('message.running')"
               />
            </transition>
         </div>
         <div
            class="navTab"
            :class="{ selected : selTab === 1 }"
            @click="selectTab(1)"
         >
            {{ t('word.server', 1) }}
            <transition name="fade">
               <i
                  v-if="serverStatus === 1"
                  class="mdi mdi-play running"
                  :title="t('message.running')"
               />
            </transition>
         </div>
      </nav>
      <div class="settings-block">
         <div
            class="navSettings"
            :title="t('word.source')"
            @click="openOutside('https://github.com/Fabio286/mizar')"
         >
            <i class="mdi mdi-github" />
         </div>
         <div
            class="navSettings"
            :title="t('word.settings')"
            @click="isSettingModal=true"
         >
            <i class="mdi mdi-cog" />
         </div>
      </div>
      <ModalSettings v-if="isSettingModal" @hide-settings="isSettingModal=false" />
   </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import ModalSettings from './ModalSettings.vue';
import { shell } from 'electron';

defineProps({
   selTab: Number,
   clientStatus: Number,
   serverStatus: Number
});

const isSettingModal = ref(false);

const emit = defineEmits(['selectTab']);

const { t } = useI18n();

const selectTab = (value: number) => {
   emit('selectTab', value);
};

const openOutside = (link: string) => {
   shell.openExternal(link);
};
</script>
<style scoped lang="scss">
.settings-block {
  display: flex;
  gap: 10px;
}
</style>
