import { getScheduleForDay } from '../functions/scheduleSettings.js';
import { groupIgnoreMiddleware } from '../functions/middleware/groupIgnoreMiddleware.js';
import { registrationMiddleware } from '../functions/middleware/registrationMiddleware.js';

const setupScheduleTodayCommand = (bot) => {
    bot.command('schedule_today', groupIgnoreMiddleware, registrationMiddleware, (ctx) => {
        let today = new Date().toLocaleDateString('ru-RU', { weekday: 'long' });
        today = today.charAt(0).toUpperCase() + today.slice(1);
        const todaySchedule = getScheduleForDay(today);

        if (todaySchedule) {
            ctx.reply(`<b>Расписание на сегодня (${today})</b>:\n\n${todaySchedule}`, { parse_mode: 'HTML', disable_web_page_preview: true });
        } else {
            ctx.reply('На сегодня нет запланированных пар.');
        }
    });
};

export { setupScheduleTodayCommand };