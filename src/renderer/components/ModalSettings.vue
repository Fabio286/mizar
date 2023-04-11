<template>
   <div id="popcontainer">
      <div class="popup" :style="'min-width: 350px;'">
         <div class="box-100">
            <h4>{{ t('word.settings') }}</h4>
            <div class="input-element">
               <label>{{ t('word.locale', 1) }}</label>
               <select
                  v-model="localLocale"
                  @change="changeLocale(localLocale)"
               >
                  <option
                     v-for="locale in locales"
                     :key="locale.code"
                     :value="locale.code"
                  >
                     {{ locale.name }} | {{ locale.code }}
                  </option>
               </select>
            </div>
            <div class="creditsBox">
               <img :src="appLogo" width="128">
               <div>
                  {{ appName }} v{{ appVersion }}
               </div>
               <div>
                  {{ t('word.author') }}: <a class="c-hand" @click="openOutside('https://github.com/Fabio286')">{{ appAuthor }}</a>
               </div>
            </div>
            <div class="buttons">
               <button class="cancel" @click="close">
                  {{ t('word.close') }}
               </button>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { ref, computed, Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSettingsStore } from '@/stores/settings';
import { useApplicationStore } from '@/stores/application';
import { AvailableLocale } from '@/i18n';
import { storeToRefs } from 'pinia';
import { localesNames } from '@/i18n/supported-locales';
import { shell } from 'electron';

const settingsStore = useSettingsStore();
const { appVersion, appName } = useApplicationStore();
const { changeLocale } = settingsStore;
const { locale: selectedLocale } = storeToRefs(settingsStore);

const emit = defineEmits(['hide-settings', 'create-port']);

const { t } = useI18n();

const appAuthor = 'Fabio Di Stasio';
const appLogo = require('../images/mizar.svg');
const localLocale: Ref<AvailableLocale> = ref(null);

const locales = computed(() => {
   const locales = [];
   for (const locale of Object.keys(localesNames))
      locales.push({ code: locale, name: localesNames[locale] });

   return locales;
});

const close = () => {
   emit('hide-settings');
};

const openOutside = (link: string) => {
   shell.openExternal(link);
};

localLocale.value = selectedLocale.value;
</script>
<style lang="scss">
.creditsBox {
   display: flex;
   align-items: center;
   padding: 15px 0;
   flex-direction: column;
   gap: 8px;
}
</style>
