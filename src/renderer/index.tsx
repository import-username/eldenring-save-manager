import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import App from './components/App';
import { NotificationContextProvider } from './context/NotificationContext';

ReactDOM.render(
    <React.StrictMode>
        <NotificationContextProvider>
            <App />
        </NotificationContextProvider>
    </React.StrictMode>,
    document.getElementById('root')
);

