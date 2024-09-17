import fs from 'fs';
import path from 'path';
import { sendMessageToAllUsers } from './sendMessageToAllUsers.js';
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scheduleSettingsPath = path.join(__dirname, '..', 'data', 'scheduleSettings.json');

// Переменная для хранения времени последнего изменения файла
let lastModifiedTime;

// Функция для проверки изменений в файле
export function checkForScheduleChanges() {
    fs.stat(scheduleSettingsPath, (err, stats) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }

        const currentModifiedTime = stats.mtime;

        // Проверяем, изменился ли файл
        if (!lastModifiedTime || currentModifiedTime > lastModifiedTime) {
            lastModifiedTime = currentModifiedTime;
            sendMessageToAllUsers('Расписание было обновлено. Пожалуйста, проверьте новые изменения.');
        }
    });
}

// Инициализация времени последнего изменения файла при запуске
fs.stat(scheduleSettingsPath, (err, stats) => {
    if (err) {
        console.error('Error initializing file modification time:', err);
        return;
    }
    lastModifiedTime = stats.mtime;
});
