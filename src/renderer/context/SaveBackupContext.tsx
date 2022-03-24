import React, { FunctionComponent, useContext, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";
import type { Stats } from "fs";
import "../css/save-backup-menu.css";

export interface ContextValue {
    displaySaveBackupMenu: (save: SaveBackup) => void,
    hideSaveBackupMenu: () => void,
    saveBackupMenuComponent: FunctionComponent
}

export interface SaveBackup {
    name: string,
    stats: Stats,
    size: number
}

const SaveBackupContext = React.createContext<null | ContextValue>(null);

function SaveBackupMenu({ save, onExit }: { save: SaveBackup | null, onExit: () => void }) {
    function closeMenu(event: any): void {
        if (event) {
            if ([...(event.target as Element).classList].includes("save-backup-overlay-container")) {
                onExit();
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

    function BackupMenu() {
        return (
            <>
                {
                    displayMenu
                    ?   <SaveBackupMenu save={selectedSave} onExit={hideSaveBackupMenu}/>
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
