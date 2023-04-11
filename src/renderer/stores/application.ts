import { defineStore } from 'pinia';
import * as Store from 'electron-store';
const persistentStore = new Store({ name: 'settings' });

export const useApplicationStore = defineStore('application', {
   state: () => ({
      appName: 'Mizar TCP tester',
      appVersion: process.env.PACKAGE_VERSION || '0',
      cachedVersion: persistentStore.get('cached_version', '0') as string,
      isLoading: false,
      isSettingModal: false,
      selectedSettingTab: 'general',
      updateStatus: 'noupdate', // 'noupdate' | 'available' | 'checking' | 'nocheck' | 'downloading' | 'downloaded' | 'disabled'
      downloadProgress: 0
   }),
   getters: {
      getDownloadProgress: state => Number(state.downloadProgress.toFixed(1))
   },
   actions: {
      checkVersionUpdate () {
         if (this.appVersion !== this.cachedVersion) {
            this.showSettingModal('changelog');
            this.cachedVersion = this.appVersion;
            persistentStore.set('cached_version', this.cachedVersion);
         }
      },
      setLoadingStatus (payload: boolean) {
         this.isLoading = payload;
      },
      // Modals
      showSettingModal (tab: string) {
         this.selectedSettingTab = tab;
         this.isSettingModal = true;
      },
      hideSettingModal () {
         this.isSettingModal = false;
      }
   }
});
