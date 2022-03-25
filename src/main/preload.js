const { contextBridge, ipcRenderer } = require("electron");

const validChannels = [
    "getBackups",
    "getSavePath",
    "setSavePath",
    "applySaveBackup",
    "deleteSaveBackup",
    "backupSaveManual",
    "displaySavePathDialog"
];

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
