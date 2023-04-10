import { defineStore } from 'pinia';
import { ipcRenderer } from 'electron';
import { i18n, AvailableLocale } from '@/i18n';
import * as Store from 'electron-store';

const settingsStore = new Store({ name: 'settings' });
const isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
const defaultAppTheme = isDarkTheme.matches ? 'dark' : 'light';

export type EditorFontSize = 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge';
export type ApplicationTheme = 'light' | 'dark';

export const useSettingsStore = defineStore('settings', {
   state: () => ({
      locale: settingsStore.get('locale', 'en-US') as AvailableLocale,
      allowPrerelease: settingsStore.get('allow_prerelease', true) as boolean,
      applicationTheme: settingsStore.get('application_theme', defaultAppTheme) as ApplicationTheme
   }),
   actions: {
      changeLocale (locale: AvailableLocale) {
         this.locale = locale;
         i18n.global.locale = locale;
         settingsStore.set('locale', this.locale);
         console.log(this.locale);
      },
      changeApplicationTheme (theme: string) {
         this.applicationTheme = theme;
         settingsStore.set('application_theme', this.applicationTheme);
         ipcRenderer.send('refresh-theme-settings');
      }
   }
});
