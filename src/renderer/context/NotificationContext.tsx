import React, { FunctionComponent, useContext, useState } from "react";
import "../css/notification-container.css";

export interface ContextValue {
    display: (notificationColor: "red" | "green", notificationText: string, duration?: number) => void,
    hide: () => void,
    visible: boolean,
    overlay: FunctionComponent
}

const NotificationContext = React.createContext<null | ContextValue>(null);

export function NotificationContextProvider({ children }: { children: JSX.Element }) {
    const [visible, setVisible]: [boolean, React.SetStateAction<any>] = useState(false);

    const [color, setColor]: ["red" | "green" | undefined, React.SetStateAction<any>] = useState();

    const [text, setText]: [string | undefined, React.SetStateAction<any>] = useState();

    function displayNotification(notificationColor: "red" | "green", notificationText: string, duration?: number) {
        if (/red|green/.test(notificationColor)) {
            setColor(() => notificationColor);

            setText(() => notificationText);

            setVisible(() => true);
        }

        if (duration && typeof duration === "number") {
            setTimeout(() => {
                setColor(() => null);

                setText(() => null);

                hideNotification();
            }, duration);
        }
    }

    function hideNotification() {
        setVisible(() => false);
    }

    function NotificationOverlay() {
        return (
            <>
                {
                    visible
                    ?   <div className="notification-overlay-container">
                            <Notification />
                        </div>
                    :   undefined
                }
            </>
        );
    }

    function Notification() {
        return (
            <div className={`notification-container ${color === "red" ? "red-notification-container" : "green-notification-container"}`}>
                <span>{ text }</span>
            </div>
        );
    }

    const contextValue: ContextValue = {
        display: displayNotification,
        hide: hideNotification,
        visible,
        overlay: NotificationOverlay
    }

    return (
        <NotificationContext.Provider value={contextValue}>
            { children }
        </NotificationContext.Provider>
    );
}

export default function useNotificationContext() {
    return useContext(NotificationContext);
}
