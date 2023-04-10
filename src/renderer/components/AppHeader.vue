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
                  class="material-icons running"
                  :title="t('message.running')"
               >play_arrow</i>
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
                  class="material-icons running"
                  :title="t('message.running')"
               >play_arrow</i>
            </transition>
         </div>
      </nav>
      <div
         class="navSettings"
         :title="t('word.settings')"
         @click="isSettingModal=true"
      >
         <i class="material-icons">settings</i>
      </div>
      <ModalSettings v-if="isSettingModal" @hide-settings="isSettingModal=false" />
   </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import ModalSettings from './ModalSettings.vue';

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
</script>
