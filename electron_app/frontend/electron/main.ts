/*
  Formats app pop-up, redirects "launch game" button click to open EmulationStation,
  and also closes the electron window and terminal after EmulationStation launches.
*/

import { app, BrowserWindow } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { screen, ipcMain } from 'electron'; // Import the screen module to access display properties
import { exec } from "child_process";

import os from "os";

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null = null; // Define globally

function createWindow() {
  // Get the primary display dimensions
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  // Create a fullscreen window; width and height are dynamic, based on machine's dimensions
  // Note: For final product, use fullscreen
  win = new BrowserWindow({
    width,
    height,
    fullscreen: true, 
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  });

  // win.setBounds({ x: 0, y: 0, width, height });

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// ======================================================================

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    console.log('Quitting app...');
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  createWindow();

  // Frontend will call this function via IPC 
  // This will close our Electron app and start up EmulationStation
  ipcMain.on("start-emulationstation", () => {
    console.log("Launching EmulationStation...");

    // Specify path to the bash script
    const homeDir = os.homedir();
    const scriptPath = path.resolve(homeDir, 'rPI-Arcade/electron_app/backend/boot_to_emulation.sh');

    // Run bash script to open boot menu and run emulationstation
    exec(scriptPath, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error launching EmulationStation: ${error.message}`);
        return;
      }
      console.log(`EmulationStation Output: ${stdout}`);
      if (stderr) console.error(`EmulationStation Errors: ${stderr}`);      
    });

    // Wait for 5 seconds before closing the Electron window
    setTimeout(() => {
      // Now, close the Electron window after the delay
      if (win) {
        console.log('Closing the Electron window...');
        win.close();
        win = null;
      }

      console.log('Exiting terminal...');

      // Specify path to the exit bash script
      const exitPath = path.resolve(homeDir, 'rPI-Arcade/electron_app/backend/exit.sh');

      // Run bash script to exit terminal
      exec(exitPath, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error exiting terminal: ${error.message}`);
          return;
        }
        console.log(`Output: ${stdout}`);
        if (stderr) console.error(`Errors: ${stderr}`);      
      });
      
    }, 5000); // 5000 milliseconds = 5 seconds

  });

});
