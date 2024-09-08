import { Markup } from 'telegraf';
import fs from 'fs';

const filePath = './src/data/weekdaySettings.json';

const weekdays = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

const loadSettings = () => {
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    return {};
};

const saveSettings = (settings) => {
    fs.writeFileSync(filePath, JSON.stringify(settings, null, 2));
};

export const getWeekdayKeyboard = (prefix = 'toggle') => {
    const settings = loadSettings();
    const buttons = weekdays.map((day, index) => {
        const isEnabled = settings[day] !== false;
        return Markup.button.callback(`${isEnabled ? '✅' : '❌'} ${day}`, `${prefix}_${index}`);
    });
    return Markup.inlineKeyboard(buttons, { columns: 2 });
};

export const handleWeekdayToggle = (ctx) => {
    const settings = loadSettings();
    const dayIndex = parseInt(ctx.match[1], 10);
    const day = weekdays[dayIndex];
    settings[day] = !settings[day];
    saveSettings(settings);
    ctx.editMessageText('Выберите дни недели:', getWeekdayKeyboard());
};