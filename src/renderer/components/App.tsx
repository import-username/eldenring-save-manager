import React, { useEffect, useState } from 'react';
import { FaSave, FaCog } from "react-icons/fa";
import useNotificationContext from '../context/NotificationContext';
import type { ContextValue } from '../context/NotificationContext';
import "../css/App.css";
import SaveBackup from './SaveBackup';
import useSaveBackupContext, { ContextValue as BackupMenuContext, SaveBackup as ISaveBackup } from '../context/SaveBackupContext';

function App() {
    const [saves, setSaves]: [ISaveBackup[], React.SetStateAction<any>] = useState([]);

    const [savePath, setSavePath]: [string, React.SetStateAction<any>] = useState("...");

    const {
        saveBackupMenuComponent: SaveBackupMenu,
        displaySaveBackupMenu
    }: BackupMenuContext = useSaveBackupContext() as BackupMenuContext;

    const { overlay: NotificatonOverlay, display: displayNotification }: ContextValue = useNotificationContext() as ContextValue;

    async function displayFileDialog(): Promise<void> {
        const directory = await window.api.invoke("displaySavePathDialog", null);

        if (directory) {
            setSavePath(() => directory);
        }
    }

    async function getSavePathData(): Promise<void> {
        try {
            const path = await window.api.invoke("getSavePath", null);

            if (path) {
                setSavePath(() => path);
            }
        } catch (err) {
            setSavePath(() => "Click to add folder containing elden ring save(s).");
        }
    }

    async function onManualBackupClick(): Promise<void> {
        try {
            await window.api.invoke("backupSaveManual", null);
    
            const backups = await window.api.invoke("getBackups", null);

            addSaveBackup(backups, true);
        } catch (exc: any) {
            displayNotification("red", exc.message, 4500);
        }
    }

    function onSaveBackupClick(save: ISaveBackup): void {
        displaySaveBackupMenu(save);
    }

    function addSaveBackup(save: ISaveBackup | ISaveBackup[], overwrite?: boolean): void {
        if (Array.isArray(save)) {
            if (overwrite) {
                setSaves(() => [...save]);
            } else {
                setSaves(() => [...saves, ...save]);
            }
        } else {
            if (overwrite) {
                setSaves(() => [save]);
            } else {
                setSaves(() => [...saves, save]);
            }
        }
    }

    function onSaveBackupDelete(name: string): void {
        if (name) {
            setSaves(() => saves.filter((save) => {
                return save.name !== name;
            }));
        }
    }

    useEffect(() => {
        getSavePathData();

        window.api.invoke("getBackups", null).then((backups: ISaveBackup[]) => {
            addSaveBackup(backups, true);
        });
    }, []);

    return (
        <div className="main-container">
            <div className="content-container">
                <div className="title-container">
                    <button className="manual-backup-button" onClick={onManualBackupClick}>
                        <FaSave />
                    </button>
                    <span className="title-span">Elden Ring Save Manager</span>
                    <button className="settings-button">
                        <FaCog />
                    </button>
                </div>
                <button className="save-path-button" onClick={displayFileDialog}>
                    <span>{`Saves path: ${savePath}`}</span>
                </button>
            </div>
            <NotificatonOverlay />
            <div className="save-backup-container">
                {
                    saves.sort((current: ISaveBackup, prev: ISaveBackup): number => {
                        return new Date(current.stats.birthtime).getTime() -
                                new Date(prev.stats.birthtime).getTime()
                    }).map((save: ISaveBackup) => {
                        return (
                            <SaveBackup key={save.name} save={save} onClick={onSaveBackupClick.bind(null, save)}/>
                        );
                    })
                }
            </div>
            <SaveBackupMenu onDelete={onSaveBackupDelete}/>
        </div>
    );
}

export default App;
