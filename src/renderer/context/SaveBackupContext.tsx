import React, { FunctionComponent, useContext, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";
import type { Stats } from "fs";
import "../css/save-backup-menu.css";
import useNotificationContext, { ContextValue as NotifContext } from "./NotificationContext";

export interface ContextValue {
    displaySaveBackupMenu: (save: SaveBackup) => void,
    hideSaveBackupMenu: () => void,
    saveBackupMenuComponent: FunctionComponent<{ onDelete?: (name: string) => void }>
}

export interface SaveBackup {
    name: string,
    stats: Stats,
    size: number
}

const SaveBackupContext = React.createContext<null | ContextValue>(null);

function SaveBackupMenu({ save, onExit, onDelete }: { save: SaveBackup | null, onExit: () => void, onDelete?: (name: string) => void }) {
    const { display: displayNotification }: NotifContext = useNotificationContext() as NotifContext;

    function closeMenu(event: any): void {
        if (event) {
            if ([...(event.target as Element).classList].includes("save-backup-overlay-container")) {
                onExit();
            }
        }
    }

    async function onDeleteBackupClick(): Promise<void> {
        if (save != null) {
            try {
                await window.api.invoke("deleteSaveBackup", save.name);

                if (onDelete) {
                    onDelete(save.name);
                }
    
                onExit();
            } catch (exc: any) {
                const errorMessage: string = exc instanceof Error ? exc.message : "An error occured.";
    
                displayNotification("red", errorMessage, 4500);
            }
        }
    }

    return (
        <div className="save-backup-overlay-container" onClick={closeMenu}>
            <div className="save-backup-menu-container">
                <button className="save-backup-menu-exit-btn" onClick={onExit}>
                    <FaTimes />
                </button>
                <span className="save-backup-menu-title">
                    {`Save name: ${save && save.name}`}
                </span>
                <button className="delete-backup-button" onClick={onDeleteBackupClick}>
                    <span>Delete</span>
                </button>
            </div>
        </div>
    );
}

export function SaveBackupContextProvider({ children }: { children: JSX.Element | JSX.Element[] }) {
    const [displayMenu, setDisplayMenu]: [boolean, React.SetStateAction<any>]  = useState(false);

    const [selectedSave, setSelectedSave]: [SaveBackup | null, React.SetStateAction<any>] = useState(null);

    function displaySaveBackupMenu(save: SaveBackup): void {
        setDisplayMenu(() => true);

        setSelectedSave(() => save);
    }

    function hideSaveBackupMenu(): void {
        setDisplayMenu(() => false);
    }

    function BackupMenu({ onDelete }: { onDelete?: (name: string) => void} ) {
        return (
            <>
                {
                    displayMenu
                    ?   <SaveBackupMenu save={selectedSave} onExit={hideSaveBackupMenu} onDelete={onDelete}/>
                    :   undefined
                }
            </>
        );
    }

    const contextValue: ContextValue = {
        displaySaveBackupMenu,
        hideSaveBackupMenu,
        saveBackupMenuComponent: BackupMenu
    }

    return (
        <SaveBackupContext.Provider value={contextValue}>
            { children }
        </SaveBackupContext.Provider>
    );
}

export default function useSaveBackupContext() {
    return useContext(SaveBackupContext);
}
