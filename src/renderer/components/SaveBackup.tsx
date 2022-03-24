import React from "react";
import type { SaveBackup as ISaveBackup } from "../context/SaveBackupContext";
import "../css/save-backup.css";

export default function SaveBackup({ save, onClick }: { save: ISaveBackup, onClick?: () => void }) {
    const createDate: string = (save.stats.birthtime as Date).toDateString() + " " + (save.stats.birthtime as Date).toLocaleTimeString();
    
    const size: string = `${(save.size / 1000000)}`.substring(0, 5) + "MB";

    return (
        <button className="save-backup" onClick={() => { onClick && onClick() }}>
            <span>Name: { save.name }</span>
            <span>Date: { createDate }</span>
            <span>Size: { size }</span>
        </button>
    );
}