const { app, BrowserWindow } = require("electron");
const osc = require("osc");

const BUZZIN_START = "/buzzosc/start";
const BUZZIN_PAUSE = "/buzzosc/pause";
const BUZZIN_RESET = "/buzzosc/reset";
const BUZZIN_CLEAR_BUZZERS = "/buzzosc/clear-buzzers";
const BUZZIN_TOGGLE_LOCK = "/buzzosc/toggle-lock";

const oscPayload = {
  [BUZZIN_START]: { id: "timerStart" },
  [BUZZIN_PAUSE]: { id: "timerPause" },
  [BUZZIN_RESET]: { id: "timerReset" },
  [BUZZIN_CLEAR_BUZZERS]: { id: "resetAll" },
  [BUZZIN_TOGGLE_LOCK]: { id: "toggleLock" },
};

let win;

let udpPort = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: 57121,
  metadata: true,
});

udpPort.on("error", (err) => {
  console.log("OSC: an error occurred: ", err.message);
});

udpPort.on("message", (msg) => {
  if (Object.keys(oscPayload).includes(msg.address)) {
    win.webContents.send("osc", oscPayload[msg.address]);
  }
});

if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      enableRemoteModule: false,
      preload: `${__dirname}/renderer.js`,
    },
    devTools: false,
  });

  win.loadURL("https://buzzin.live/");

  // win.webContents.openDevTools();
};

app.on("ready", () => {
  udpPort.open();
  createWindow();
});

app.on("before-quit", () => {
  udpPort = null;
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
