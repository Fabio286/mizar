'use strict';
import { ipcRenderer } from 'electron';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import '@mdi/font/css/materialdesignicons.css';
import '@/css/reset.css';
import '@/scss/main.scss';

import { useApplicationStore } from '@/stores/application';
import { useSettingsStore } from '@/stores/settings';

import App from '@/App.vue';
import { i18n } from '@/i18n';

createApp(App)
   .use(createPinia())
   .use(i18n)
   .mount('#app');

const { locale } = useSettingsStore();
i18n.global.locale = locale;

// IPC exceptions
// ipcRenderer.on('unhandled-exception', (event, error) => {
//    // useNotificationsStore().addNotification({ status: 'error', message: error.message }); TODO: send to console
// });

// IPC app updates
ipcRenderer.on('checking-for-update', () => {
   useApplicationStore().updateStatus = 'checking';
});

ipcRenderer.on('update-available', () => {
   useApplicationStore().updateStatus = 'available';
});

ipcRenderer.on('update-not-available', () => {
   useApplicationStore().updateStatus = 'noupdate';
});

ipcRenderer.on('check-failed', () => {
   useApplicationStore().updateStatus = 'nocheck';
});

ipcRenderer.on('no-auto-update', () => {
   useApplicationStore().updateStatus = 'disabled';
});

ipcRenderer.on('download-progress', (event, data) => {
   useApplicationStore().updateStatus = 'downloading';
   useApplicationStore().downloadProgress = data.percent;
});

ipcRenderer.on('update-downloaded', () => {
   useApplicationStore().updateStatus = 'downloaded';
});

ipcRenderer.on('link-to-download', () => {
   useApplicationStore().updateStatus = 'link';
});

// IPC shortcuts
ipcRenderer.on('toggle-preferences', () => {
   useApplicationStore().showSettingModal('general');
});

ipcRenderer.on('open-updates-preferences', () => {
   useApplicationStore().showSettingModal('update');
   ipcRenderer.send('check-for-updates');
});
