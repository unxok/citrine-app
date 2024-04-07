import { app, shell, BrowserWindow, ipcMain, dialog } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import * as fs from "fs";
// const { versions } = require("node:process");
// console.log(versions);

export const separateFileExtension = (str: string) => {
  const regex = /^(.*)\.([^.]*)$/;
  const match = str.match(regex);
  if (!match) return ["", ""];
  const [, title, extension] = match;
  // console.log(title);
  // console.log(extension);
  return [title, extension];
};

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    frame: false,
    height: 670,
    show: false,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "rgba(0,0,0,0)",
      symbolColor: "rgb(255,0,0,1)",
      // height: 60
    },
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  (async () => {
    const theme =
      (await mainWindow.webContents.executeJavaScript(
        'localStorage.getItem("vite-ui-theme");',
      )) ?? "dark";
    console.log("theme: ", theme);
    mainWindow.setTitleBarOverlay({
      color: "rgba(0,0,0,0)",
      symbolColor: theme === "dark" ? "rgb(255,255,255)" : "rgb(0,0,0)",
      // height: ,
    });
  })();

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // IPC test
  ipcMain.on("ping", () => console.log("pong"));

  ipcMain.handle("open-vault", async () => {
    const selectedDir = dialog.showOpenDialogSync({
      properties: ["openDirectory"],
    });

    if (!selectedDir || !selectedDir.length)
      return dialog.showErrorBox("Open Vault Error", "No vault selected!");

    const files = fs
      .readdirSync(selectedDir[0], {
        withFileTypes: true,
      })
      .map((f) => {
        const [name, extension] = separateFileExtension(f.name);
        return {
          name: name,
          extension: extension,
          path: f.path,
        };
      });
    console.log(selectedDir);
    return {
      vaultName: selectedDir[0],
      files: files,
    };
  });

  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
