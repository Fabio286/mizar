import { app, BrowserWindow, nativeImage, ipcMain, Menu } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as Store from 'electron-store';
import { ChildProcess, fork, Serializable } from 'child_process';
import * as windowStateKeeper from 'electron-window-state';
import * as remoteMain from '@electron/remote/main';

// import ipcHandlers from './ipc-handlers';

Store.initRenderer();
const settingsStore = new Store({ name: 'settings' });
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
   const icon = require('../renderer/assets/icons/icon.png');
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
ipcMain.on('startTest', (event, { params, hosts }) => {
   event.sender.send('clientLog', { message: 'Test avviato', color: '' });
   // clientProcess = fork(`${appRoot}/src/forks/clientProcess.js`);

   const startEvent = params.stepTest ? 'startStep' : 'start';

   const testParams = {
      event: startEvent,
      params,
      // storagePath,
      hosts
   };
   clientProcess.send(testParams);

   clientProcess.on('message', (message: any) => {
      if (!mainWindow) return;
      switch (message.event) {
         case 'log':
            mainWindow.webContents.send('clientLog', message.content);
            break;
         case 'finish':
            if (params.loop)
               clientProcess.send(testParams);
            else {
               mainWindow.webContents.send('testFinish', message.content);
               clientProcess.kill();
            }
            break;
         case 'report':
            mainWindow.webContents.send('reportClientList', message.content);
            break;
      }
   });
});

ipcMain.on('sendMessages', (event) => {
   clientProcess.send({ event: 'sendStep' });
   event.sender.send('clientLog', { message: 'Invio messaggi in corso', color: '' });
});

ipcMain.on('stopTest', (event) => {
   try {
      clientProcess.send({ event: 'stop' });
      event.sender.send('testFinish', 'Test interrotto');
   }
   catch (error) {
      clientProcess.kill();
   }
});

// Server
let serverProcess: ChildProcess;
ipcMain.on('startServer', (event, { params, ports }) => {
   event.sender.send('serverLog', { message: 'Server avviato', color: '' });
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
            mainWindow.webContents.send('serverLog', message.content);
            break;
         case 'report':
            mainWindow.webContents.send('reportServerList', message.content);
            break;
      }
   });
});

ipcMain.on('stopServer', (event) => {
   try {
      serverProcess.send({ event: 'stop' });
      event.sender.send('serverFinish', 'Server stoppato');
   }
   catch (error) {
      serverProcess.kill();
   }
});

ipcMain.on('resetReports', () => {
   if (!mainWindow) return;
   try {
      serverProcess.send({ event: 'reset' });
   }
   catch (error) {
      const data = {
         message: error.stack,
         color: 'red'
      };
      mainWindow.webContents.send('serverLog', data);
   }
});

function saveWindowState () {
   mainWindowState.saveState(mainWindow);
}
