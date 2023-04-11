import { app, BrowserWindow, nativeImage, ipcMain, Menu } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as Store from 'electron-store';
import { ChildProcess, fork, Serializable } from 'child_process';
import * as windowStateKeeper from 'electron-window-state';
import * as remoteMain from '@electron/remote/main';
import { autoUpdater } from 'electron-updater';

Store.initRenderer();
const settingsStore = new Store({ name: 'settings' });
autoUpdater.allowPrerelease = settingsStore.get('allow_prerelease', true) as boolean;
// const appTheme = settingsStore.get('application_theme');
const isDevelopment = process.env.NODE_ENV !== 'production';
const isMacOS = process.platform === 'darwin';
// const isLinux = process.platform === 'linux';
const isWindows = process.platform === 'win32';
const gotTheLock = app.requestSingleInstanceLock();

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow: BrowserWindow;
let mainWindowState: windowStateKeeper.State;

async function createMainWindow () {
   const icon = require('../../assets/mizar-64.png');
   const window = new BrowserWindow({
      width: mainWindowState.width,
      height: mainWindowState.height,
      x: mainWindowState.x,
      y: mainWindowState.y,
      minWidth: 900,
      minHeight: 500,
      show: !isWindows,
      title: 'Mizar TCP Tester',
      icon: nativeImage.createFromDataURL(icon.default),
      webPreferences: {
         nodeIntegration: true,
         contextIsolation: false,
         devTools: isDevelopment,
         spellcheck: false
      },
      autoHideMenuBar: true,
      // titleBarStyle: isLinux ? 'default' :'hidden',
      // titleBarOverlay: isWindows
      //    ? {
      //       color: appTheme === 'dark' ? '#383e42' : '#fff',
      //       symbolColor: appTheme === 'dark' ? '#fff' : '#000',
      //       height: 30
      //    }
      //    : false,
      trafficLightPosition: isMacOS ? { x: 10, y: 8 } : undefined,
      backgroundColor: '#1d1d1d'
   });

   mainWindowState.manage(window);
   Menu.setApplicationMenu(null);
   window.on('moved', saveWindowState);

   remoteMain.enable(window.webContents);

   try {
      if (isDevelopment)
         await window.loadURL('http://localhost:9080');
      else {
         const indexPath = path.resolve(__dirname, 'index.html');
         await window.loadFile(indexPath);
      }
   }
   catch (err) {
      console.log(err);
   }

   window.on('closed', () => {
      window.removeListener('moved', saveWindowState);
      mainWindow = null;
   });

   return window;
}

if (!gotTheLock) app.quit();
else {
   require('@electron/remote/main').initialize();

   // Initialize ipcHandlers
   // ipcHandlers();

   ipcMain.on('refresh-theme-settings', () => {
      const appTheme = settingsStore.get('application_theme');
      if (isWindows && mainWindow) {
         mainWindow.setTitleBarOverlay({
            color: appTheme === 'dark' ? '#3f3f3f' : '#fff',
            symbolColor: appTheme === 'dark' ? '#fff' : '#000'
         });
      }
   });

   ipcMain.on('change-window-title', (_, title: string) => {
      if (mainWindow) mainWindow.setTitle(title);
   });

   // quit application when all windows are closed
   app.on('window-all-closed', () => {
      // on macOS it is common for applications to stay open until the user explicitly quits
      if (!isMacOS) app.quit();
   });

   app.on('activate', async () => {
      // on macOS it is common to re-create a window even after all windows have been closed
      if (mainWindow === null)
         mainWindow = await createMainWindow();
   });

   // create main BrowserWindow when electron is ready
   app.on('ready', async () => {
      mainWindowState = windowStateKeeper({
         defaultWidth: 1024,
         defaultHeight: 800
      });

      mainWindow = await createMainWindow();

      if (isWindows)
         mainWindow.show();

      if (isDevelopment)
         mainWindow.webContents.openDevTools();

      process.on('uncaughtException', error => {
         mainWindow.webContents.send('unhandled-exception', error);
      });

      process.on('unhandledRejection', error => {
         mainWindow.webContents.send('unhandled-exception', error);
      });
   });

   app.on('browser-window-created', (event, window) => {
      if (isDevelopment) {
         const { mizar } = require('../../package.json');
         const extensionPath = path.resolve(__dirname, `../../misc/${mizar.devtoolsId}`);
         window.webContents.session.loadExtension(extensionPath, { allowFileAccess: true }).catch(console.error);
      }
   });
}

// Client
let clientProcess: ChildProcess;
ipcMain.on('start-test', (event, { params, hosts, messages }) => {
   event.sender.send('client-log', { message: '', color: '', i18n: 'testStarted' });
   clientProcess = fork(isDevelopment ? './dist/clientProcess.js' : path.resolve(__dirname, './clientProcess.js'), [], {
      execArgv: isDevelopment ? ['--inspect=9225'] : undefined
   });

   const startEvent = params.stepTest ? 'startStep' : 'start';

   const testParams = {
      event: startEvent,
      params,
      hosts,
      messages
   };
   clientProcess.send(testParams);

   clientProcess.on('message', (message: {event: string; content: string}) => {
      if (!mainWindow) return;
      switch (message.event) {
         case 'log':
            mainWindow.webContents.send('client-log', message.content);
            break;
         case 'finish':
            if (params.loop)
               clientProcess.send(testParams);
            else {
               mainWindow.webContents.send('test-finish', message.content);
               clientProcess.kill();
            }
            break;
         case 'report':
            mainWindow.webContents.send('report-client-list', message.content);
            break;
      }
   });
});

ipcMain.on('send-messages', (event) => {
   clientProcess.send({ event: 'sendStep' });
   event.sender.send('client-log', { i18n: 'sendingMessages', color: '' });
});

ipcMain.on('stop-test', (event) => {
   try {
      clientProcess.send({ event: 'stop' });
      event.sender.send('test-finish', 'testAborted');
   }
   catch (error) {
      clientProcess.kill();
   }
});

// Server
let serverProcess: ChildProcess;
ipcMain.on('start-server', (event, { params, ports }) => {
   event.sender.send('server-log', { i18n: 'serverStart', color: '' });
   serverProcess = fork(isDevelopment ? './dist/serverProcess.js' : path.resolve(__dirname, './serverProcess.js'), [], {
      execArgv: isDevelopment ? ['--inspect=9224'] : undefined
   });

   const message = {
      event: 'start',
      params,
      ports
   };
   serverProcess.send(message);

   serverProcess.on('message', (message: Serializable & {event: string; content: string}) => {
      if (!mainWindow) return;
      switch (message.event) {
         case 'log':
            mainWindow.webContents.send('server-log', message.content);
            break;
         case 'report':
            mainWindow.webContents.send('report-server-list', message.content);
            break;
      }
   });
});

ipcMain.on('stop-server', (event) => {
   try {
      serverProcess.send({ event: 'stop' });
      event.sender.send('server-finish', 'serverStop');
   }
   catch (error) {
      serverProcess.kill();
   }
});

ipcMain.on('reset-reports', () => {
   if (!mainWindow) return;
   try {
      serverProcess.send({ event: 'reset' });
   }
   catch (error) {
      const data = {
         message: error.stack,
         color: 'red'
      };
      mainWindow.webContents.send('server-log', data);
   }
});

function saveWindowState () {
   mainWindowState.saveState(mainWindow);
}
