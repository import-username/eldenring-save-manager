const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const jsonStorage = require("electron-json-storage");
const isDev = require("electron-is-dev");
const { nanoid } = require("nanoid");
const fse = require("fs-extra");
const path = require("path");
const fs = require("fs");

const PORT = process.env.PORT || "3000";

const createWindow = () => {
    const win = new BrowserWindow({
        width: 500,
        height: 750,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true,
            devTools: isDev
        }
    });

    if (isDev) {
        win.loadURL(`http://localhost:${PORT}`);
    } else {
        win.setMenu(null);
        win.loadURL(`file://${__dirname}/index.html`);
    }
}

app.whenReady().then(() => {
    createWindow();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("ready", () => {
    const backupsPath = path.join(app.getPath("userData"), "backups");

    if (!fs.existsSync(backupsPath)) {
        fs.mkdirSync(backupsPath);
    }

    ipcMain.handle("getSavePath", async (event) => {
        return new Promise((resolve, reject) => {
            jsonStorage.get("settings", (err, data) => {
                if (err || !data || !data.savePath) {
                    return reject(new Error("Failed to read save path property from json data."));
                }
                
                return resolve(data.savePath);
            });
        });
    });

    ipcMain.handle("displaySavePathDialog", async (event) => {
        const path = await dialog.showOpenDialog({
            properties: ["openDirectory"]
        });

        if (!path || path.canceled) {
            return undefined;
        }
        
        const selectedDirectoryPath = path.filePaths[0];

        jsonStorage.set("settings", { savePath: selectedDirectoryPath });

        return selectedDirectoryPath;
    });

    ipcMain.handle("backupSaveManual", async (event) => {
        return new Promise((resolve, reject) => {
            jsonStorage.get("settings", (err, data) => {
                if (err || !data || !data.savePath) {
                    return reject(new Error("Failed to read save path property from json data."));
                }
                
                if (isValidSavesDirectory(data.savePath)) {
                    if (backupsPath && backupsPath.length > 3) {
                        const backupSavePath = path.join(backupsPath, nanoid(11));

                        fs.mkdirSync(backupSavePath);

                        try {
                            copySaveDirectory(
                                getDirectoryContainingSave(data.savePath),
                                backupSavePath
                            );
    
                            return resolve(data.savePath);
                        } catch (err) {
                            return reject(new Error("Failed to create backup."));
                        }
                    } else {
                        return reject(new Error("Failed to create backup."));
                    }
                } else {
                    return reject(new Error("Selected directory does not contain .sl2 save files."));
                }
            });
        });
    });

    ipcMain.handle("deleteSaveBackup", async (event, backupDir) => {
        return new Promise((resolve, reject) => {
            if (!backupDir || !fs.existsSync(path.join(backupsPath, backupDir))) {
                return reject(new Error("Invalid backup name."));
            }

            try {
                const deletePath = path.join(backupsPath, backupDir);

                fs.rmSync(deletePath, { recursive: true });
    
                return resolve();
            } catch (exc) {
                return reject(new Error("Failed to delete backup."));
            }
        });
    });

    ipcMain.handle("applySaveBackup", async (event, backupName) => {
        return new Promise((resolve, reject) => {
            if (!backupName || !fs.existsSync(path.join(backupsPath, backupName))) {
                return reject(new Error("Invalid backup name."));
            }

            jsonStorage.get("settings", (err, data) => {
                if (err || !data || !data.savePath) {
                    return reject(new Error("Failed to read save path property from json data."));
                }

                try {
                    const saveBackupPath = path.join(backupsPath, backupName);
    
                    const saveDirectory = getDirectoryContainingSave(data.savePath);

                    const saveBackups = fs.readdirSync(saveBackupPath);

                    for (let save of saveBackups) {
                        const backupFilePath = path.join(saveBackupPath, save);

                        const destination = path.join(saveDirectory, save);

                        fse.copySync(backupFilePath, destination);
                    }

                    return resolve();
                } catch (exc) {
                    console.log(exc)
                    return reject(new Error("Failed to apply backup."));
                }
            });
        });
    });

    ipcMain.handle("getBackups", async (event) => {
        const saves = fs.readdirSync(backupsPath);

        return saves.map((save) => {
            return {
                name: save,
                stats: fs.statSync(path.join(backupsPath, save)),
                size: getBackupSize(path.join(backupsPath, save))
            };
        });
    });
});

function copySaveDirectory(saveDirectory, destination) {
    const files = fs.readdirSync(saveDirectory);

    if (!saveDirectory || !destination) {
        throw new Error("Failed to provide save directory and destination paths.");
    }

    if (files && files.length > 0 && isValidSavesDirectory(saveDirectory)) {
        try {
            for (let file of files) {
                if (/.bak|.sl2/.test(file)) {
                    const savePath = path.join(saveDirectory, file);

                    const destinationPath = path.join(destination, file);

                    fse.copySync(savePath, destinationPath);
                }
            }
        } catch (exc) {
            throw exc;
        }
    }
}

function getDirectoryContainingSave(directory) {
    const files = fs.readdirSync(directory);

    if (!files || files.length < 1) {
        return false;
    }

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const filePath = path.join(directory, file);

        if (path.extname(file) === ".sl2") {
            return directory;
        }

        if (fs.lstatSync(filePath).isDirectory()) {
            return getDirectoryContainingSave(filePath);
        } else {
            return false;
        }
    }
}

function isValidSavesDirectory(directory) {
    const files = fs.readdirSync(directory);

    if (!files || files.length < 1) {
        return false;
    }

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const filePath = path.join(directory, file);

        if (path.extname(file) === ".sl2") {
            return true;
        }

        if (fs.lstatSync(filePath).isDirectory()) {
            return isValidSavesDirectory(filePath);
        } else {
            return false;
        }
    }
}

function getBackupSize(backupPath) {
    let size = 0;

    if (!backupPath) {
        return 0;
    }

    const files = fs.readdirSync(backupPath);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const filePath = path.join(backupPath, file);

        if (fs.lstatSync(filePath).isDirectory()) {
            size += getBackupSize(filePath);
        } else {
            size += fs.statSync(filePath).size;
        }
    }

    return size;
}
