const { contextBridge, ipcRenderer } = require("electron");

const validChannels = ["setSavePath", "getSavePath", "displaySavePathDialog", "backupSaveManual", "getBackups"];

contextBridge.exposeInMainWorld("api", {
    send: (channel, data) => {
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    invoke: async (channel, data) => {
        if (validChannels.includes(channel)) {
            return ipcRenderer.invoke(channel, data);
        }
    }
});
