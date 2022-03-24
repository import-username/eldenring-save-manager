import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import App from './components/App';
import { NotificationContextProvider } from './context/NotificationContext';
import { SaveBackupContextProvider } from './context/SaveBackupContext';

ReactDOM.render(
    <React.StrictMode>
        <NotificationContextProvider>
            <SaveBackupContextProvider>
                <App />
            </SaveBackupContextProvider>
        </NotificationContextProvider>
    </React.StrictMode>,
    document.getElementById('root')
);

