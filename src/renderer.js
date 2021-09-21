const { ipcRenderer } = require('electron');

ipcRenderer.on("osc", (event, message) => {
  const btn = document.getElementById(message.id);

  if (btn) {
    btn.click();
  } else {
    alert("You must create a Buzzin.live game before sending OSC commands.");
  }
});
