import { checkAirAlert } from './checkAirAlert.js';
import { sendMessageToAllUsers } from '../sendMessageToAllUsers.js';

let currentAlertStatus = null; // Переменная для хранения текущего статуса тревоги

const initializeAlertStatus = async () => {
    try {
        const response = await checkAirAlert();
        if (response && response.data) {
            currentAlertStatus = response.data;
        }
    } catch (error) {
        console.error('Error initializing alert status:', error);
    }
};

const checkAndNotify = async () => {
    try {
        const response = await checkAirAlert();
        if (response && response.data) {
            const alertStatus = response.data;
            if (alertStatus !== currentAlertStatus) {
                currentAlertStatus = alertStatus;
                // Отправка сообщений пользователям о изменении статуса тревоги
                const message = alertStatus === 'N'
                    ? '🟢 <b>Одеська область</b> – відбій повітряної тривоги!'
                    : '🔴 <b>Одеська область</b> – повітряна тривога!';
                await sendMessageToAllUsers(message);
            }
        }
    } catch (error) {
        console.error('Error checking air alert:', error);
    }
};

export { checkAndNotify, initializeAlertStatus };