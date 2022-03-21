import React from "react";
import "../css/save-backup.css";

export default function SaveBackup({ save }: { save: any }) {
    const createDate: string = (save.stats.birthtime as Date).toDateString() + " " + (save.stats.birthtime as Date).toLocaleTimeString();
    
    const size: string = `${(save.size / 1000000)}`.substring(0, 5) + "MB";

    return (
        <div className="save-backup">
            <span>Name: { save.name }</span>
            <span>Date: { createDate }</span>
            <span>Size: { size }</span>
        </div>
    );
}