import { app, BrowserWindow, ipcMain, screen } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { exec } from "child_process";
import os from "os";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win = null;
function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  win = new BrowserWindow({
    width,
    height,
    fullscreen: true,
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    console.log("Quitting app...");
    app.quit();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(() => {
  createWindow();
  ipcMain.on("start-emulationstation", () => {
    console.log("Launching EmulationStation...");
    const homeDir = os.homedir();
    const scriptPath = path.resolve(homeDir, "rPI-Arcade/electron_app/backend/boot_to_emulation.sh");
    exec(scriptPath, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error launching EmulationStation: ${error.message}`);
        return;
      }
      console.log(`EmulationStation Output: ${stdout}`);
      if (stderr) console.error(`EmulationStation Errors: ${stderr}`);
    });
    setTimeout(() => {
      if (win) {
        console.log("Closing the Electron window...");
        win.close();
        win = null;
      }
      console.log("Exiting terminal...");
      const exitPath = path.resolve(homeDir, "rPI-Arcade/electron_app/backend/exit.sh");
      exec(exitPath, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error exiting terminal: ${error.message}`);
          return;
        }
        console.log(`Output: ${stdout}`);
        if (stderr) console.error(`Errors: ${stderr}`);
      });
    }, 5e3);
  });
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
